import sharp from 'sharp';
import { LocalProvider } from "@andrewgosselin/idk.file-helper";
import { FileMetadata } from "@andrewgosselin/idk.file-helper";
import { Readable } from "stream";
import { unstable_cache } from "next/cache";
import { promises as fs } from "fs";
import { revalidatePath } from "next/cache";
import path from "path";
import { ImageVariantConfig } from '@/variants/images/types';

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

export class ImageService {
  static async processVariant(
    fileId: string,
    variantConfig: ImageVariantConfig
  ): Promise<FileMetadata> {
    await ensureUploadDir();

    // Always get the source file stream - variants should always be generated from the original source
    const sourceStream = await provider.getFileStream(fileId, 'source');
    const fileMetadata = await provider.findById(fileId);
    
    if (!fileMetadata) {
      throw new Error(`File with id ${fileId} not found`);
    }
    
    try {
      // Convert stream to buffer first to ensure complete data
      const chunks: Buffer[] = [];
      for await (const chunk of sourceStream) {
        chunks.push(chunk);
      }
      const sourceBuffer = Buffer.concat(chunks);
      
      // Create a Sharp instance from the buffer with explicit input options
      let sharpInstance = sharp(sourceBuffer, {
        failOn: 'none', // Don't fail on corrupt images
        limitInputPixels: false // Don't limit input size
      });

      // Apply operations based on the variant config
      if (variantConfig.operations) {
        const { resize, convert, blurhash } = variantConfig.operations;

        if (resize) {
          sharpInstance = sharpInstance.resize({
            height: resize.height,
            width: resize.width,
            fit: resize.fit || 'cover',
            position: resize.position || 'center'
          });
        }

        if (convert) {
          sharpInstance = sharpInstance.toFormat(convert.format as keyof sharp.FormatEnum, {
            quality: 80, // Set a reasonable quality
            effort: 4 // Balance between speed and compression
          });
        }
      }

      // Get the processed buffer with error handling
      const processedBuffer = await sharpInstance.toBuffer().catch((error: Error) => {
        console.error('Error processing image:', error);
        throw new Error(`Failed to process image: ${error.message}`);
      });

      // Save the variant using the variant name
      const variantName = variantConfig.name.toLowerCase().replace(/\s+/g, '-');
      await provider.saveVariant(fileId, variantName, processedBuffer);

      // Update the file metadata to include the new variant
      const updatedMetadata = {
        ...fileMetadata,
        variants: [...(fileMetadata.variants || []), variantName],
        updatedAt: new Date()
      };

      // Save the updated metadata without changing the source file
      const sourceStreamForUpdate = await provider.getFileStream(fileId, 'source');
      const updateChunks: Buffer[] = [];
      for await (const chunk of sourceStreamForUpdate) {
        updateChunks.push(chunk);
      }
      const sourceBufferForUpdate = Buffer.concat(updateChunks);
      
      await provider.update(fileId, sourceBufferForUpdate, {
        variants: updatedMetadata.variants,
        updatedAt: updatedMetadata.updatedAt
      });

      // Revalidate the files list
      revalidatePath("/api/files");
      revalidatePath("/");

      return updatedMetadata;
    } catch (error: unknown) {
      console.error('Error in processVariant:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to process variant: ${errorMessage}`);
    }
  }

  static async processAllVariants(
    fileId: string,
    variantConfigs: ImageVariantConfig[]
  ): Promise<FileMetadata> {
    await ensureUploadDir();
    
    let currentMetadata = await provider.findById(fileId);
    if (!currentMetadata) {
      throw new Error(`File with id ${fileId} not found`);
    }

    for (const config of variantConfigs) {
      currentMetadata = await this.processVariant(fileId, config);
    }

    return currentMetadata;
  }

  static getVariant = unstable_cache(
    async (fileId: string, variantName: string): Promise<FileMetadata | null> => {
      await ensureUploadDir();
      return provider.findById(fileId);
    },
    ["variant"],
    {
      revalidate: CACHE_TTL,
      tags: ["files"],
    }
  );
}
