import { Readable } from 'stream';
import { ProviderDefinition, FileMetadata } from './providers/base';
export declare class File {
    private provider;
    constructor(provider: ProviderDefinition);
    create(file: Buffer | Readable, metadata: Omit<FileMetadata, 'id' | 'createdAt' | 'updatedAt'>): Promise<FileMetadata>;
    update(id: string, file: Buffer | Readable, metadata?: Partial<Omit<FileMetadata, 'id' | 'createdAt' | 'updatedAt'>>): Promise<FileMetadata>;
    destroy(id: string): Promise<void>;
    find(query: Partial<FileMetadata>): Promise<FileMetadata[]>;
    findById(id: string): Promise<FileMetadata | null>;
    getFileStream(id: string, variant?: string): Promise<Readable>;
}
//# sourceMappingURL=file.d.ts.map