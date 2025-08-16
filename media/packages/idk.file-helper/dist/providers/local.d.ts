import { Readable } from 'stream';
import { ProviderDefinition, FileMetadata } from './base';
export interface LocalProviderConfig {
    storagePath: string;
}
export declare class LocalProvider extends ProviderDefinition {
    name: string;
    private storagePath;
    constructor(config: LocalProviderConfig);
    private ensureStoragePath;
    private getFileDir;
    private getFilePath;
    private getMetadataPath;
    private saveMetadata;
    private readMetadata;
    create(file: Buffer | Readable, metadata: Omit<FileMetadata, 'id' | 'createdAt' | 'updatedAt'>): Promise<FileMetadata>;
    update(id: string, file: Buffer | Readable, metadata?: Partial<Omit<FileMetadata, 'id' | 'createdAt' | 'updatedAt'>>): Promise<FileMetadata>;
    destroy(id: string): Promise<void>;
    find(query: Partial<FileMetadata>): Promise<FileMetadata[]>;
    findById(id: string): Promise<FileMetadata | null>;
    getFileStream(id: string, variant?: string): Promise<Readable>;
    saveVariant(id: string, variant: string, file: Buffer | Readable): Promise<void>;
}
//# sourceMappingURL=local.d.ts.map