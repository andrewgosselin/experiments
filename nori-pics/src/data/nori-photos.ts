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
}

// Cache the image loading function
export async function getNoriPhotos(): Promise<NoriPhoto[]> {
  const imagesDir = path.join(
    process.cwd(),
    "public",
    "assets",
    "images",
    "nori"
  );
  const files = fs.readdirSync(imagesDir);

  // Filter for image files
  const imageFiles = files.filter((file) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
  );

  // Create photo objects for each image
  const photos: NoriPhoto[] = imageFiles.map((file, index) => {
    const id = (index + 1).toString();
    const filename = path.parse(file).name;

    // Generate a random category for variety
    const categories: Array<NoriPhoto["category"]> = [
      "sleeping",
      "playing",
      "eating",
      "exploring",
      "cuddling",
    ];
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];

    // Generate random date within last year
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365));

    return {
      id,
      src: `${APP_URL}/assets/images/nori/${file}`,
      alt: `Nori ${randomCategory} - ${filename}`,
      title: `${filename.charAt(0).toUpperCase() + filename.slice(1)}`,
      category: randomCategory,
      date: randomDate.toISOString().split("T")[0],
      description: `Nori ${randomCategory} - captured in ${filename}`,
      tags: [randomCategory, "nori", "cat"],
      width: 300,
      height: 200,
    };
  });

  return photos;
}

export const categories = [
  "all",
  "sleeping",
  "playing",
  "eating",
  "exploring",
  "cuddling",
] as const;
