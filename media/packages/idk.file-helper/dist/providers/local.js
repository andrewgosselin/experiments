import { promises as fs } from 'fs';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ProviderDefinition } from './base';
export class LocalProvider extends ProviderDefinition {
    constructor(config) {
        super();
        this.name = 'local';
        this.storagePath = config.storagePath;
    }
    async ensureStoragePath() {
        await fs.mkdir(this.storagePath, { recursive: true });
    }
    getFileDir(id) {
        return path.join(this.storagePath, id);
    }
    getFilePath(id, variant, ext) {
        return path.join(this.getFileDir(id), `${id}.${variant}${ext}`);
    }
    getMetadataPath(id) {
        return path.join(this.getFileDir(id), 'info.json');
    }
    async saveMetadata(id, metadata) {
        await fs.writeFile(this.getMetadataPath(id), JSON.stringify(metadata, null, 2));
    }
    async readMetadata(id) {
        try {
            const data = await fs.readFile(this.getMetadataPath(id), 'utf-8');
            return JSON.parse(data);
        }
        catch (_a) {
            return null;
        }
    }
    async create(file, metadata) {
        await this.ensureStoragePath();
        const id = uuidv4();
        const now = new Date();
        // Create the base metadata with required fields
        const fileMetadata = {
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
        }
        else {
            const writeStream = createWriteStream(filePath);
            await new Promise((resolve, reject) => {
                file.pipe(writeStream)
                    .on('finish', () => resolve())
                    .on('error', reject);
            });
        }
        await this.saveMetadata(id, fileMetadata);
        return fileMetadata;
    }
    async update(id, file, metadata) {
        const existingMetadata = await this.readMetadata(id);
        if (!existingMetadata) {
            throw new Error(`File with id ${id} not found`);
        }
        const filePath = this.getFilePath(id, 'source', `.${existingMetadata.ext}`);
        if (Buffer.isBuffer(file)) {
            await fs.writeFile(filePath, file);
        }
        else {
            const writeStream = createWriteStream(filePath);
            await new Promise((resolve, reject) => {
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
    async destroy(id) {
        const fileDir = this.getFileDir(id);
        try {
            await fs.rm(fileDir, { recursive: true, force: true });
        }
        catch (error) {
            throw new Error(`Failed to delete file with id ${id}`);
        }
    }
    async find(query) {
        const files = await fs.readdir(this.storagePath);
        const results = [];
        for (const id of files) {
            const metadata = await this.readMetadata(id);
            if (metadata) {
                const matches = Object.entries(query).every(([key, value]) => metadata[key] === value);
                if (matches) {
                    results.push(metadata);
                }
            }
        }
        return results;
    }
    async findById(id) {
        return this.readMetadata(id);
    }
    async getFileStream(id, variant = 'source') {
        const metadata = await this.readMetadata(id);
        if (!metadata) {
            throw new Error(`File with id ${id} not found`);
        }
        const filePath = this.getFilePath(id, variant, `.${metadata.ext}`);
        try {
            return createReadStream(filePath);
        }
        catch (error) {
            throw new Error(`Failed to read file with id ${id} and variant ${variant}`);
        }
    }
    async saveVariant(id, variant, file) {
        const metadata = await this.readMetadata(id);
        if (!metadata) {
            throw new Error(`File with id ${id} not found`);
        }
        const filePath = this.getFilePath(id, variant, `.${metadata.ext}`);
        if (Buffer.isBuffer(file)) {
            await fs.writeFile(filePath, file);
        }
        else {
            const writeStream = createWriteStream(filePath);
            await new Promise((resolve, reject) => {
                file.pipe(writeStream)
                    .on('finish', () => resolve())
                    .on('error', reject);
            });
        }
    }
}
//# sourceMappingURL=local.js.map