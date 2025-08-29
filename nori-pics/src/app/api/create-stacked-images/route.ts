import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getPlaiceholder } from 'plaiceholder';

// Create stacked composite images for background columns
async function createStackedImages(imageFiles: string[], imagesDir: string, outputDir: string): Promise<string[]> {
  console.log(`Starting stacked image creation for ${imageFiles.length} images...`);
  console.log(`Images directory: ${imagesDir}`);
  console.log(`Output directory: ${outputDir}`);
  
  const stackedImages: string[] = [];
  const imagesPerStack = 20; // Number of images per stacked composite
  const stackWidth = 400; // Width of each stack (increased for better quality)
  const imageHeight = 250; // Height of each individual image (increased for better quality)
  const stackHeight = imageHeight * imagesPerStack; // Total height of stack
  
  console.log(`Stack dimensions: ${stackWidth}x${stackHeight}, ${imagesPerStack} images per stack`);
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    console.log(`Creating output directory: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
  } else {
    console.log(`Output directory already exists: ${outputDir}`);
  }
  
  // Process images in groups
  for (let i = 0; i < imageFiles.length; i += imagesPerStack) {
    const batch = imageFiles.slice(i, i + imagesPerStack);
    const stackIndex = Math.floor(i / imagesPerStack);
    
    console.log(`Processing batch ${stackIndex + 1}: ${batch.length} images`);
    
    try {
      // Create a canvas for the stacked image
      const composite = sharp({
        create: {
          width: stackWidth,
          height: stackHeight,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      });
      
      // Add each image to the stack
      const overlays = [];
      for (let index = 0; index < batch.length; index++) {
        const file = batch[index];
        const imagePath = path.join(imagesDir, file);
        
        // Check if image file exists
        if (!fs.existsSync(imagePath)) {
          console.error(`  ❌ Image file not found: ${imagePath}`);
          throw new Error(`Image file not found: ${file}`);
        }
        
        console.log(`  Adding image ${index + 1}: ${file} at position ${index * imageHeight}`);
        
              // Resize and convert to buffer with higher quality
      const resizedBuffer = await sharp(imagePath)
        .resize(stackWidth, imageHeight, { fit: 'cover' })
        .jpeg({ quality: 95, mozjpeg: true })
        .toBuffer();
        
        overlays.push({
          input: resizedBuffer,
          top: index * imageHeight,
          left: 0
        });
      }
      
      // Generate the stacked image
      const stackedImagePath = path.join(outputDir, `stack-${stackIndex}.jpg`);
      console.log(`Creating stacked image: ${stackedImagePath}`);
      
      if (overlays.length === 0) {
        console.warn(`⚠️ No overlays to composite for batch ${stackIndex + 1}`);
        continue;
      }
      
      await composite
        .composite(overlays)
        .jpeg({ quality: 95, mozjpeg: true })
        .toFile(stackedImagePath);
      
      stackedImages.push(`/assets/images/nori-stacked/stack-${stackIndex}.jpg`);
      console.log(`✅ Created stacked image ${stackIndex + 1}: ${stackedImages.length}/${Math.ceil(imageFiles.length / imagesPerStack)}`);
      
    } catch (error) {
      console.error(`❌ Error creating stacked image ${stackIndex}:`, error);
      if (error instanceof Error) {
        console.error(`Error details:`, error.message);
        console.error(`Stack trace:`, error.stack);
      }
    }
  }
  
  console.log(`Stacked image creation complete. Created ${stackedImages.length} images.`);
  return stackedImages;
}

// Generate blurhash for a stacked image
async function generateStackedImageBlurhash(imagePath: string): Promise<string> {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const { base64 } = await getPlaiceholder(imageBuffer, {
      size: 8, // Small size for faster generation
      format: ['jpeg'],
    });
    return base64;
  } catch (error) {
    console.error(`Error generating blurhash for stacked image ${imagePath}:`, error);
    // Return fallback base64 placeholder
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXwGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
  }
}

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Parse request body for limit parameter
    let limit: number | undefined;
    try {
      const body = await request.json();
      limit = body.limit;
    } catch {
      // No body or invalid JSON, use all images
    }
    
    const imagesDir = path.join(process.cwd(), "public", "assets", "images", "nori");
    
    if (!fs.existsSync(imagesDir)) {
      return NextResponse.json({ error: "Images directory not found" }, { status: 404 });
    }

    const files = fs.readdirSync(imagesDir);
    let imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    // Apply limit if specified
    if (limit && limit > 0) {
      imageFiles = imageFiles.slice(0, limit);
      console.log(`Creating stacked images for ${imageFiles.length} images (limited to ${limit})...`);
    } else {
      console.log(`Creating stacked images for ${imageFiles.length} images...`);
    }

    // Create stacked composite images for background columns
    console.log("Creating stacked composite images...");
    const stackedOutputDir = path.join(process.cwd(), "public", "assets", "images", "nori-stacked");
    const stackedImages = await createStackedImages(imageFiles, imagesDir, stackedOutputDir);
    
    // Generate blurhash placeholders for each stacked image
    console.log("Generating blurhash placeholders for stacked images...");
    const stackedImagesWithBlurhash = [];
    
    for (let i = 0; i < stackedImages.length; i++) {
      const imagePath = stackedImages[i];
      const fullImagePath = path.join(process.cwd(), "public", imagePath);
      
      console.log(`Generating blurhash for stacked image ${i + 1}/${stackedImages.length}`);
      const blurhash = await generateStackedImageBlurhash(fullImagePath);
      
      stackedImagesWithBlurhash.push({
        src: imagePath,
        blurhash: blurhash,
        width: 400,
        height: 5000
      });
    }
    
    // Update the generated JSON file with stacked image paths and blurhash
    const jsonPath = path.join(process.cwd(), "src", "data", "nori-photos-generated.json");
    if (fs.existsSync(jsonPath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        existingData.stackedImages = stackedImagesWithBlurhash;
        existingData.totalStacked = stackedImagesWithBlurhash.length;
        existingData.stackedImagesGeneratedAt = new Date().toISOString();
        
        fs.writeFileSync(jsonPath, JSON.stringify(existingData, null, 2));
        console.log(`Updated JSON file with ${stackedImagesWithBlurhash.length} stacked images and blurhash`);
      } catch (error) {
        console.warn("Could not update JSON file with stacked images:", error);
      }
    }
    
    const totalTime = Date.now() - startTime;
    
    console.log(`Created ${stackedImages.length} stacked composite images in ${totalTime}ms`);
    
    return NextResponse.json({
      success: true,
      totalImages: imageFiles.length,
      stackedImages: stackedImages.length,
      limit: limit || 'all',
      processingTime: totalTime,
      message: `Successfully created ${stackedImages.length} stacked images from ${imageFiles.length} source images in ${totalTime}ms`
    });
    
  } catch (error) {
    console.error("Error creating stacked images:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Failed to create stacked images", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to create stacked composite images",
    endpoint: "/api/create-stacked-images",
    usage: {
      method: "POST",
      body: {
        limit: "number (optional) - limit number of images to process for testing"
      },
      examples: [
        "POST /api/create-stacked-images (process all images)",
        "POST /api/create-stacked-images { \"limit\": 50 } (process only 50 images)"
      ],
      description: "Creates composite stacked images by combining multiple photos vertically. Each stack contains up to 20 images."
    }
  });
}
