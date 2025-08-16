import { Readable } from 'stream';
import { ProviderDefinition, FileMetadata } from './providers/base';

export class File {
  private provider: ProviderDefinition;

  constructor(provider: ProviderDefinition) {
    this.provider = provider;
  }

  async create(
    file: Buffer | Readable,
    metadata: Omit<FileMetadata, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FileMetadata> {
    return this.provider.create(file, metadata);
  }

  async update(
    id: string,
    file: Buffer | Readable,
    metadata?: Partial<Omit<FileMetadata, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<FileMetadata> {
    return this.provider.update(id, file, metadata);
  }

  async destroy(id: string): Promise<void> {
    return this.provider.destroy(id);
  }

  async find(query: Partial<FileMetadata>): Promise<FileMetadata[]> {
    return this.provider.find(query);
  }

  async findById(id: string): Promise<FileMetadata | null> {
    return this.provider.findById(id);
  }

  async getFileStream(id: string, variant?: string): Promise<Readable> {
    return this.provider.getFileStream(id, variant);
  }
} 