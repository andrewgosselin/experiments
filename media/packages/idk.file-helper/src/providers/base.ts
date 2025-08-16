import { Readable } from 'stream';

export interface FileMetadata {
  id: string;
  name: string;
  ext: string;
  mimeType: string;
  size: number;
  title?: string;
  description?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any; // Allow additional metadata
}

export abstract class ProviderDefinition {
  abstract name: string;
  
  abstract create(
    file: Buffer | Readable,
    metadata: Omit<FileMetadata, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FileMetadata>;
  
  abstract update(
    id: string,
    file: Buffer | Readable,
    metadata?: Partial<Omit<FileMetadata, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<FileMetadata>;
  
  abstract destroy(id: string): Promise<void>;
  
  abstract find(query: Partial<FileMetadata>): Promise<FileMetadata[]>;
  
  abstract findById(id: string): Promise<FileMetadata | null>;
  
  abstract getFileStream(id: string, variant?: string): Promise<Readable>;
} 