import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getPlaiceholder } from 'plaiceholder';
import { NoriPhoto } from '@/data/nori-photos';

// Generate deterministic categories based on filename hash
function getCategoryFromFilename(filename: string): NoriPhoto["category"] {
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    const char = filename.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const categories: Array<NoriPhoto["category"]> = [
    "sleeping", "playing", "eating", "exploring", "cuddling"
  ];
  return categories[Math.abs(hash) % categories.length];
}

// Generate deterministic date based on filename hash
function getDateFromFilename(filename: string): string {
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    const char = filename.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const baseDate = new Date();
  const daysOffset = (hash % 365) + 1;
  baseDate.setDate(baseDate.getDate() - daysOffset);
  
  return baseDate.toISOString().split("T")[0];
}

// Generate plaiceholder for an image
async function generatePlaiceholder(imagePath: string): Promise<string> {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const { base64 } = await getPlaiceholder(imageBuffer, {
      size: 4, // Smaller size for faster generation
      format: ['jpeg'],
    });
    return base64;
  } catch (error) {
    console.error(`Error generating plaiceholder for ${imagePath}:`, error);
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
      console.log(`Processing ${imageFiles.length} images (limited to ${limit}) with optimized settings...`);
    } else {
      console.log(`Processing ${imageFiles.length} images with optimized settings...`);
    }

    // Process images in larger batches with more parallelization
    const batchSize = 50; // Increased batch size
    const photos: NoriPhoto[] = [];
    
    for (let i = 0; i < imageFiles.length; i += batchSize) {
      const batch = imageFiles.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (file, batchIndex) => {
        const globalIndex = i + batchIndex;
        const id = (globalIndex + 1).toString();
        const filename = path.parse(file).name;
        const category = getCategoryFromFilename(filename);
        const date = getDateFromFilename(filename);
        
        // Generate plaiceholder
        const imagePath = path.join(imagesDir, file);
        const plaiceholder = await generatePlaiceholder(imagePath);
        
        return {
          id,
          src: `/assets/images/nori/${file}`,
          alt: `Nori ${category} - ${filename}`,
          title: `${filename.charAt(0).toUpperCase() + filename.slice(1)}`,
          category,
          date,
          description: `Nori ${category} - captured in ${filename}`,
          tags: [category, "nori", "cat"],
          width: 300,
          height: 200,
          plaiceholder,
        };
      });
      
      const batchResults = await Promise.all(batchPromises);
      photos.push(...batchResults);
      
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(imageFiles.length / batchSize)} (${batch.length} images)`);
    }

    // Save to JSON file
    const outputPath = path.join(process.cwd(), "src", "data", "nori-photos-generated.json");
    const data = {
      photos,
      total: photos.length,
      stackedImages: [], // Will be populated by stacked images API
      totalStacked: 0,
      generatedAt: new Date().toISOString(),
      categories: ["all", "sleeping", "playing", "eating", "exploring", "cuddling"]
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    const totalTime = Date.now() - startTime;
    const avgTimePerImage = totalTime / photos.length;
    
    console.log(`Generated photo data for ${photos.length} images in ${totalTime}ms`);
    console.log(`Average time per image: ${avgTimePerImage.toFixed(2)}ms`);
    console.log(`Data written to: ${outputPath}`);
    
    return NextResponse.json({
      success: true,
      total: photos.length,
      limit: limit || 'all',
      generatedAt: data.generatedAt,
      processingTime: totalTime,
      avgTimePerImage: avgTimePerImage.toFixed(2),
      message: `Successfully generated data for ${photos.length} images in ${totalTime}ms`
    });
    
  } catch (error) {
    console.error("Error regenerating photos:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Failed to regenerate photos", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to regenerate photo data",
    endpoint: "/api/regenerate-photos",
    usage: {
      method: "POST",
      body: {
        limit: "number (optional) - limit number of images to process for testing"
      },
      examples: [
        "POST /api/regenerate-photos (process all images)",
        "POST /api/regenerate-photos { \"limit\": 50 } (process only 50 images)"
      ]
    }
  });
}
