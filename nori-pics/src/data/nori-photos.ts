"use cache";

import { APP_URL } from "@/config/general";
import fs from "fs";
import path from "path";

export interface NoriPhoto {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: "sleeping" | "playing" | "eating" | "exploring" | "cuddling";
  date: string;
  description: string;
  tags: string[];
  width?: number;
  height?: number;
  plaiceholder?: string;
}

// No need for manual caching - Next.js "use cache" directive handles this

// Pre-computed categories and dates for consistency
const categoryOptions: Array<NoriPhoto["category"]> = [
  "sleeping",
  "playing", 
  "eating",
  "exploring",
  "cuddling",
];

// Generate deterministic categories based on filename hash
function getCategoryFromFilename(filename: string): NoriPhoto["category"] {
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    const char = filename.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return categoryOptions[Math.abs(hash) % categoryOptions.length];
}

// Generate deterministic date based on filename hash
function getDateFromFilename(filename: string): string {
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    const char = filename.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // Use hash to generate a date within last year
  const baseDate = new Date();
  const daysOffset = (hash % 365) + 1;
  baseDate.setDate(baseDate.getDate() - daysOffset);
  
  return baseDate.toISOString().split("T")[0];
}

// Cache the image loading function
export async function getNoriPhotos(): Promise<NoriPhoto[]> {
  // Try to load from generated JSON file first (much faster)
  try {
    const generatedPath = path.join(process.cwd(), "src", "data", "nori-photos-generated.json");
    if (fs.existsSync(generatedPath)) {
      const generatedData = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));
      const photos = generatedData.photos as NoriPhoto[];
      console.log(`Loaded ${photos.length} photos from generated data`);
      return photos;
    }
  } catch (error) {
    console.log("No generated data found, falling back to dynamic generation");
  }

  // Fallback to dynamic generation if no pre-generated data exists
  const imagesDir = path.join(
    process.cwd(),
    "public",
    "assets",
    "images",
    "nori"
  );
  
  try {
    const files = fs.readdirSync(imagesDir);
    // Filter for image files
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    // Create photo objects for each image
    const photos = imageFiles.map((file, index) => {
      const id = (index + 1).toString();
      const filename = path.parse(file).name;
      const category = getCategoryFromFilename(filename);
      const date = getDateFromFilename(filename);

      return {
        id,
        src: `${APP_URL}/assets/images/nori/${file}`,
        alt: `Nori ${category} - ${filename}`,
        title: `${filename.charAt(0).toUpperCase() + filename.slice(1)}`,
        category,
        date,
        description: `Nori ${category} - captured in ${filename}`,
        tags: [category, "nori", "cat"],
        width: 300,
        height: 200,
      };
    });

    return photos;
  } catch (error) {
    console.error("Error reading images directory:", error);
    return [];
  }
}

// Function to get photos by category
export async function getNoriPhotosByCategory(category: string): Promise<NoriPhoto[]> {
  const allPhotos = await getNoriPhotos();
  if (category === "all") return allPhotos;
  return allPhotos.filter(photo => photo.category === category);
}

// Function to get a subset of photos for pagination
export async function getNoriPhotosPaginated(page: number = 1, limit: number = 20): Promise<{
  photos: NoriPhoto[];
  total: number;
  hasMore: boolean;
}> {
  const allPhotos = await getNoriPhotos();
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    photos: allPhotos.slice(startIndex, endIndex),
    total: allPhotos.length,
    hasMore: endIndex < allPhotos.length
  };
}

// Function to get only a small batch of photos without loading all
export async function getNoriPhotosBatch(limit: number = 100): Promise<{
  photos: NoriPhoto[];
  total: number;
  hasMore: boolean;
}> {
  // Try to load from generated JSON file first
  try {
    const generatedPath = path.join(process.cwd(), "src", "data", "nori-photos-generated.json");
    if (fs.existsSync(generatedPath)) {
      const generatedData = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));
      const total = generatedData.total;
      const photos = generatedData.photos.slice(0, limit) as NoriPhoto[];
      console.log(`Loaded ${photos.length} of ${total} photos from generated data`);
      return {
        photos,
        total,
        hasMore: total > limit
      };
    }
  } catch (error) {
    console.log("No generated data found, falling back to dynamic generation");
  }

  // Fallback to dynamic generation
  const imagesDir = path.join(
    process.cwd(),
    "public",
    "assets",
    "images",
    "nori"
  );
  
  try {
    const files = fs.readdirSync(imagesDir);
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    const total = imageFiles.length;
    const photos = imageFiles.slice(0, limit).map((file, index) => {
      const id = (index + 1).toString();
      const filename = path.parse(file).name;
      const category = getCategoryFromFilename(filename);
      const date = getDateFromFilename(filename);

      return {
        id,
        src: `${APP_URL}/assets/images/nori/${file}`,
        alt: `Nori ${category} - ${filename}`,
        title: `${filename.charAt(0).toUpperCase() + filename.slice(1)}`,
        category,
        date,
        description: `Nori ${category} - captured in ${filename}`,
        tags: [category, "nori", "cat"],
        width: 300,
        height: 200,
      };
    });

    return {
      photos,
      total,
      hasMore: total > limit
    };
  } catch (error) {
    console.error("Error reading images directory:", error);
    return { photos: [], total: 0, hasMore: false };
  }
}

// Function to get stacked composite images for background columns
export async function getStackedImages(): Promise<{
  stackedImages: string[];
  total: number;
}> {
  try {
    const generatedPath = path.join(process.cwd(), "src", "data", "nori-photos-generated.json");
    if (fs.existsSync(generatedPath)) {
      const generatedData = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));
      const stackedImages = generatedData.stackedImages || [];
      console.log(`Loaded ${stackedImages.length} stacked images from generated data`);
      return {
        stackedImages,
        total: generatedData.total || 0
      };
    }
  } catch (error) {
    console.log("No generated data found for stacked images");
  }

  return { stackedImages: [], total: 0 };
}

// Function to get photos progressively - starts with small batch, loads more on demand
export async function getNoriPhotosProgressive(
  initialBatch: number = 25,
  additionalBatch: number = 50
): Promise<{
  initialPhotos: NoriPhoto[];
  total: number;
  loadMore: () => Promise<NoriPhoto[]>;
  hasMore: boolean;
}> {
  const allPhotos = await getNoriPhotos();
  
  // Return initial small batch
  const initialPhotos = allPhotos.slice(0, initialBatch);
  const hasMore = allPhotos.length > initialBatch;
  
  // Function to load more photos
  const loadMore = async (): Promise<NoriPhoto[]> => {
    const currentCount = initialPhotos.length;
    const nextBatch = allPhotos.slice(currentCount, currentCount + additionalBatch);
    return nextBatch;
  };
  
  return {
    initialPhotos,
    total: allPhotos.length,
    loadMore,
    hasMore
  };
}

export const categories = [
  "all",
  "sleeping",
  "playing",
  "eating",
  "exploring",
  "cuddling",
] as const;
