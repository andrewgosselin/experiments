import { Readable } from 'stream';
import { promises as fs } from 'fs';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ProviderDefinition, FileMetadata } from './base';

export interface LocalProviderConfig {
  storagePath: string;
}

export class LocalProvider extends ProviderDefinition {
  name = 'local';
  private storagePath: string;

  constructor(config: LocalProviderConfig) {
    super();
    this.storagePath = config.storagePath;
  }

  private async ensureStoragePath(): Promise<void> {
    await fs.mkdir(this.storagePath, { recursive: true });
  }

  private getFileDir(id: string): string {
    return path.join(this.storagePath, id);
  }

  private getFilePath(id: string, variant: string, ext: string): string {
    return path.join(this.getFileDir(id), `${id}.${variant}${ext}`);
  }

  private getMetadataPath(id: string): string {
    return path.join(this.getFileDir(id), 'info.json');
  }

  private async saveMetadata(id: string, metadata: FileMetadata): Promise<void> {
    await fs.writeFile(
      this.getMetadataPath(id),
      JSON.stringify(metadata, null, 2)
    );
  }

  private async readMetadata(id: string): Promise<FileMetadata | null> {
    try {
      const data = await fs.readFile(this.getMetadataPath(id), 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async create(
    file: Buffer | Readable,
    metadata: Omit<FileMetadata, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FileMetadata> {
    await this.ensureStoragePath();
    const id = uuidv4();
    const now = new Date();
    
    // Create the base metadata with required fields
    const fileMetadata: FileMetadata = {
      id,
      name: metadata.name,
      ext: metadata.ext,
      mimeType: metadata.mimeType,
      size: metadata.size,
      createdAt: now,
      updatedAt: now,
      ...metadata // This will include any additional metadata fields
    };

    // Create directory for the file
    await fs.mkdir(this.getFileDir(id), { recursive: true });

    // Save the source file
    const filePath = this.getFilePath(id, 'source', `.${metadata.ext}`);
    if (Buffer.isBuffer(file)) {
      await fs.writeFile(filePath, file);
    } else {
      const writeStream = createWriteStream(filePath);
      await new Promise<void>((resolve, reject) => {
        file.pipe(writeStream)
          .on('finish', () => resolve())
          .on('error', reject);
      });
    }

    await this.saveMetadata(id, fileMetadata);
    return fileMetadata;
  }

  async update(
    id: string,
    file: Buffer | Readable,
    metadata?: Partial<Omit<FileMetadata, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<FileMetadata> {
    const existingMetadata = await this.readMetadata(id);
    if (!existingMetadata) {
      throw new Error(`File with id ${id} not found`);
    }

    const filePath = this.getFilePath(id, 'source', `.${existingMetadata.ext}`);
    if (Buffer.isBuffer(file)) {
      await fs.writeFile(filePath, file);
    } else {
      const writeStream = createWriteStream(filePath);
      await new Promise<void>((resolve, reject) => {
        file.pipe(writeStream)
          .on('finish', () => resolve())
          .on('error', reject);
      });
    }

    const updatedMetadata = {
      ...existingMetadata,
      ...metadata,
      updatedAt: new Date(),
    };

    await this.saveMetadata(id, updatedMetadata);
    return updatedMetadata;
  }

  async destroy(id: string): Promise<void> {
    const fileDir = this.getFileDir(id);
    
    try {
      await fs.rm(fileDir, { recursive: true, force: true });
    } catch (error) {
      throw new Error(`Failed to delete file with id ${id}`);
    }
  }

  async find(query: Partial<FileMetadata>): Promise<FileMetadata[]> {
    const files = await fs.readdir(this.storagePath);
    const results = [];

    for (const id of files) {
      const metadata = await this.readMetadata(id);
      if (metadata) {
        const matches = Object.entries(query).every(
          ([key, value]) => metadata[key] === value
        );
        if (matches) {
          results.push(metadata);
        }
      }
    }

    return results;
  }

  async findById(id: string): Promise<FileMetadata | null> {
    return this.readMetadata(id);
  }

  async getFileStream(id: string, variant: string = 'source'): Promise<Readable> {
    const metadata = await this.readMetadata(id);
    if (!metadata) {
      throw new Error(`File with id ${id} not found`);
    }

    const filePath = this.getFilePath(id, variant, `.${metadata.ext}`);
    try {
      return createReadStream(filePath);
    } catch (error) {
      throw new Error(`Failed to read file with id ${id} and variant ${variant}`);
    }
  }

  async saveVariant(
    id: string,
    variant: string,
    file: Buffer | Readable
  ): Promise<void> {
    const metadata = await this.readMetadata(id);
    if (!metadata) {
      throw new Error(`File with id ${id} not found`);
    }

    const filePath = this.getFilePath(id, variant, `.${metadata.ext}`);
    if (Buffer.isBuffer(file)) {
      await fs.writeFile(filePath, file);
    } else {
      const writeStream = createWriteStream(filePath);
      await new Promise<void>((resolve, reject) => {
        file.pipe(writeStream)
          .on('finish', () => resolve())
          .on('error', reject);
      });
    }
  }
} 