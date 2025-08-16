import { LocalProvider } from "@andrewgosselin/idk.file-helper";
import { FileMetadata } from "@andrewgosselin/idk.file-helper";
import { Readable } from "stream";
import { unstable_cache } from "next/cache";
import { promises as fs } from "fs";
import { revalidatePath } from "next/cache";
import path from "path";
import { variants } from "@/variants";
import { ImageService } from "./image-service";

// Initialize the local provider
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const provider = new LocalProvider({
  storagePath: UPLOAD_DIR,
});

// Cache configuration
const CACHE_TTL = 300; // 5 minutes

// Ensure upload directory exists
async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

interface FileMetadataOptions {
  title?: string;
  description?: string;
  tags?: string[];
  variants?: string[]; // List of variant names for this file
}

export class FileService {
  static async uploadFile(
    file: Buffer | Readable,
    filename: string,
    mimeType: string,
    size: number,
    options: FileMetadataOptions = {}
  ): Promise<FileMetadata> {
    await ensureUploadDir();
    
    // Parse filename to get name and extension
    const { name, ext } = path.parse(filename);
    
    // Add source as the first variant if variants are specified
    const variants = options.variants ? ['source', ...options.variants] : ['source'];
    
    const metadata = await provider.create(file, {
      name,
      ext: ext.slice(1), // Remove the leading dot
      mimeType,
      size,
      title: options.title,
      description: options.description,
      tags: options.tags,
      variants,
    });
    // Revalidate the files list
    revalidatePath("/api/files");
    revalidatePath("/");

    return metadata;
  }

  static getFiles = unstable_cache(
    async (): Promise<FileMetadata[]> => {
      await ensureUploadDir();
      const files = await provider.find({});
      return files;
    },
    ["files"],
    {
      revalidate: CACHE_TTL,
      tags: ["files"],
    }
  );

  static getFile = unstable_cache(
    async (id: string, variant: string = 'source'): Promise<FileMetadata | null> => {
      await ensureUploadDir();
      const file = await provider.findById(id);
      
      if (!file) return null;
      
      // If requesting source, return the original file
      if (variant === 'source') {
        return file;
      }
      
      // For variants, check if it exists
      if (!file.variants?.includes(variant)) {
        return null;
      }
      
      // Try to get the variant file
      try {
        await provider.getFileStream(id, variant);
        return file;
      } catch {
        return null;
      }
    },
    ["file"],
    {
      revalidate: CACHE_TTL,
      tags: ["files"],
    }
  );

  static getFileVariant = async (id: string, variant: string = 'source'): Promise<any> => {
      await ensureUploadDir();
      const file = await provider.findById(id);
      if (!file) return null;
      
      // Check if we can generate this variant
      const type = file.mimeType.split("/")[0];
      if (!variants[type]?.[variant] && variant !== 'source') {
        return null;
      }
      // check if an uploads/{id} exists
      const uploadDir = path.join(UPLOAD_DIR, id);
      // if it does, check if the variant file exists
      const variantFile = path.join(uploadDir, `${id}.${variant}.${file.ext}`);
      try {
        await fs.stat(variantFile);
      } catch {
        // if it doesn't, generate the variant
        const variantConfig = variants[type][variant];
        await ImageService.processVariant(id, variantConfig);
      }
      return {
        path: variantFile,
      };
    };

  static async deleteFile(id: string): Promise<void> {
    await ensureUploadDir();
    await provider.destroy(id);
    revalidatePath("/api/files");
    revalidatePath("/");
  }

  static async getFileStream(id: string, variant: string = 'source'): Promise<Readable> {
    await ensureUploadDir();
    return provider.getFileStream(id, variant);
  }
} 