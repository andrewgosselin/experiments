"use cache";

import fs from 'fs';
import path from 'path';

export interface NoriPhoto {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: 'sleeping' | 'playing' | 'eating' | 'exploring' | 'cuddling';
  date: string;
  description: string;
  tags: string[];
  width?: number;
  height?: number;
}

// Cache the image loading function
export async function getNoriPhotos(): Promise<NoriPhoto[]> {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'assets', 'images', 'nori');
    const files = fs.readdirSync(imagesDir);
    
    // Filter for image files
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
    
    // Create photo objects for each image
    const photos: NoriPhoto[] = imageFiles.map((file, index) => {
      const id = (index + 1).toString();
      const filename = path.parse(file).name;
      
      // Generate a random category for variety
      const categories: Array<NoriPhoto['category']> = ['sleeping', 'playing', 'eating', 'exploring', 'cuddling'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      // Generate random date within last year
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365));
      
      return {
        id,
        src: `http://localhost:3000/assets/images/nori/${file}`,
        alt: `Nori ${randomCategory} - ${filename}`,
        title: `${filename.charAt(0).toUpperCase() + filename.slice(1)}`,
        category: randomCategory,
        date: randomDate.toISOString().split('T')[0],
        description: `Nori ${randomCategory} - captured in ${filename}`,
        tags: [randomCategory, 'nori', 'cat'],
        width: 300,
        height: 200
      };
    });
    
    return photos;
  } catch (error) {
    console.error('Error loading nori photos:', error);
    // Fallback to sample photos if there's an error
    return getSamplePhotos();
  }
}

// Fallback sample photos if file system access fails
function getSamplePhotos(): NoriPhoto[] {
  return [
    {
      id: '1',
      src: 'https://picsum.photos/300/200?random=1',
      alt: 'Nori sleeping peacefully on the couch',
      title: 'Peaceful Slumber',
      category: 'sleeping',
      date: '2024-01-15',
      description: 'Nori taking a cozy nap in the afternoon sun',
      tags: ['sleep', 'couch', 'sunlight', 'peaceful'],
      width: 300,
      height: 200
    },
    {
      id: '2',
      src: 'https://picsum.photos/300/200?random=2',
      alt: 'Nori playing with a toy mouse',
      title: 'Toy Hunter',
      category: 'playing',
      date: '2024-01-16',
      description: 'Nori showing off her hunting skills with a toy mouse',
      tags: ['play', 'toy', 'hunting', 'active'],
      width: 300,
      height: 200
    },
    {
      id: '3',
      src: 'https://picsum.photos/300/200?random=3',
      alt: 'Nori eating from her food bowl',
      title: 'Dinner Time',
      category: 'eating',
      date: '2024-01-17',
      description: 'Nori enjoying her favorite wet food',
      tags: ['food', 'hungry', 'wet food', 'bowl'],
      width: 300,
      height: 200
    },
    {
      id: '4',
      src: 'https://picsum.photos/300/200?random=4',
      alt: 'Nori exploring the garden',
      title: 'Garden Explorer',
      category: 'exploring',
      date: '2024-01-18',
      description: 'Nori investigating the new plants in the garden',
      tags: ['garden', 'nature', 'curious', 'outdoor'],
      width: 300,
      height: 200
    },
    {
      id: '5',
      src: 'https://picsum.photos/300/200?random=5',
      alt: 'Nori cuddling on the bed',
      title: 'Cuddle Bug',
      category: 'cuddling',
      date: '2024-01-19',
      description: 'Nori snuggling up for some quality cuddle time',
      tags: ['cuddle', 'bed', 'affection', 'warm'],
      width: 300,
      height: 200
    },
    // Add more sample photos for demonstration
    {
      id: '6',
      src: 'https://picsum.photos/300/200?random=6',
      alt: 'Nori sleeping in a sunbeam',
      title: 'Sunbeam Nap',
      category: 'sleeping',
      date: '2024-01-20',
      description: 'Nori finding the perfect sunny spot for a nap',
      tags: ['sleep', 'sunbeam', 'warm', 'comfortable'],
      width: 300,
      height: 200
    },
    {
      id: '7',
      src: 'https://picsum.photos/300/200?random=7',
      alt: 'Nori chasing a laser pointer',
      title: 'Laser Chaser',
      category: 'playing',
      date: '2024-01-21',
      description: 'Nori going crazy over the red dot',
      tags: ['play', 'laser', 'active', 'fun'],
      width: 300,
      height: 200
    },
    {
      id: '8',
      src: 'https://picsum.photos/300/200?random=8',
      alt: 'Nori eating treats',
      title: 'Treat Time',
      category: 'eating',
      date: '2024-01-22',
      description: 'Nori getting spoiled with her favorite treats',
      tags: ['treats', 'spoiled', 'happy', 'snacks'],
      width: 300,
      height: 200
    },
    // Additional images for the main page columns
    {
      id: '9',
      src: 'https://picsum.photos/300/200?random=9',
      alt: 'Nori sleeping in a basket',
      title: 'Basket Dreams',
      category: 'sleeping',
      date: '2024-01-23',
      description: 'Nori curled up in her favorite basket',
      tags: ['sleep', 'basket', 'cozy', 'comfortable'],
      width: 300,
      height: 200
    },
    {
      id: '10',
      src: 'https://picsum.photos/300/200?random=10',
      alt: 'Nori with a ball of yarn',
      title: 'Yarn Master',
      category: 'playing',
      date: '2024-01-24',
      description: 'Nori having fun with a colorful ball of yarn',
      tags: ['play', 'yarn', 'colorful', 'fun'],
      width: 300,
      height: 200
    },
    {
      id: '11',
      src: 'https://picsum.photos/300/200?random=11',
      alt: 'Nori drinking water',
      title: 'Hydration Station',
      category: 'eating',
      date: '2024-01-25',
      description: 'Nori staying hydrated at her water bowl',
      tags: ['water', 'hydration', 'healthy', 'bowl'],
      width: 300,
      height: 200
    },
    {
      id: '12',
      src: 'https://picsum.photos/300/200?random=12',
      alt: 'Nori on the windowsill',
      title: 'Window Watcher',
      category: 'exploring',
      date: '2024-01-26',
      description: 'Nori observing the world from her favorite perch',
      tags: ['window', 'observation', 'curious', 'perch'],
      width: 300,
      height: 200
    },
    {
      id: '13',
      src: 'https://picsum.photos/300/200?random=13',
      alt: 'Nori with her favorite blanket',
      title: 'Blanket Buddy',
      category: 'cuddling',
      date: '2024-01-27',
      description: 'Nori snuggled up with her soft blanket',
      tags: ['cuddle', 'blanket', 'soft', 'warm'],
      width: 300,
      height: 200
    },
    {
      id: '14',
      src: 'https://picsum.photos/300/200?random=14',
      alt: 'Nori sleeping on the stairs',
      title: 'Stairway Dreams',
      category: 'sleeping',
      date: '2024-01-28',
      description: 'Nori taking a nap on the staircase',
      tags: ['sleep', 'stairs', 'unusual', 'comfortable'],
      width: 300,
      height: 200
    },
    {
      id: '15',
      src: 'https://picsum.photos/300/200?random=15',
      alt: 'Nori with a feather toy',
      title: 'Feather Frenzy',
      category: 'playing',
      date: '2024-01-29',
      description: 'Nori going wild over a feather toy',
      tags: ['play', 'feather', 'excited', 'active'],
      width: 300,
      height: 200
    },
    {
      id: '16',
      src: 'https://picsum.photos/300/200?random=16',
      alt: 'Nori eating grass',
      title: 'Grass Grazer',
      category: 'eating',
      date: '2024-01-30',
      description: 'Nori nibbling on some fresh grass',
      tags: ['grass', 'natural', 'healthy', 'outdoor'],
      width: 300,
      height: 200
    },
    {
      id: '17',
      src: 'https://picsum.photos/300/200?random=17',
      alt: 'Nori in a cardboard box',
      title: 'Box Explorer',
      category: 'exploring',
      date: '2024-02-01',
      description: 'Nori investigating a new cardboard box',
      tags: ['box', 'cardboard', 'curious', 'new'],
      width: 300,
      height: 200
    },
    {
      id: '18',
      src: 'https://picsum.photos/300/200?random=18',
      alt: 'Nori with her human',
      title: 'Human Cuddles',
      category: 'cuddling',
      date: '2024-02-02',
      description: 'Nori enjoying cuddle time with her favorite human',
      tags: ['cuddle', 'human', 'affection', 'love'],
      width: 300,
      height: 200
    },
    {
      id: '19',
      src: 'https://picsum.photos/300/200?random=19',
      alt: 'Nori sleeping upside down',
      title: 'Upside Down Nap',
      category: 'sleeping',
      date: '2024-02-03',
      description: 'Nori sleeping in a funny upside down position',
      tags: ['sleep', 'funny', 'position', 'relaxed'],
      width: 300,
      height: 200
    },
    {
      id: '20',
      src: 'https://picsum.photos/300/200?random=20',
      alt: 'Nori with a paper bag',
      title: 'Bag Adventure',
      category: 'playing',
      date: '2024-02-04',
      description: 'Nori playing hide and seek with a paper bag',
      tags: ['play', 'bag', 'hide', 'seek'],
      width: 300,
      height: 200
    },
    {
      id: '21',
      src: 'https://picsum.photos/300/200?random=21',
      alt: 'Nori eating catnip',
      title: 'Catnip Time',
      category: 'eating',
      date: '2024-02-05',
      description: 'Nori enjoying some fresh catnip',
      tags: ['catnip', 'herbs', 'excited', 'natural'],
      width: 300,
      height: 200
    },
    {
      id: '22',
      src: 'https://picsum.photos/300/200?random=22',
      alt: 'Nori on the bookshelf',
      title: 'Bookworm Cat',
      category: 'exploring',
      date: '2024-02-06',
      description: 'Nori exploring the bookshelf and knocking things over',
      tags: ['bookshelf', 'exploration', 'mischievous', 'curious'],
      width: 300,
      height: 200
    },
    {
      id: '23',
      src: 'https://picsum.photos/300/200?random=23',
      alt: 'Nori with her toy mouse',
      title: 'Toy Cuddles',
      category: 'cuddling',
      date: '2024-02-07',
      description: 'Nori cuddling with her favorite toy mouse',
      tags: ['cuddle', 'toy', 'mouse', 'affection'],
      width: 300,
      height: 200
    },
    {
      id: '24',
      src: 'https://picsum.photos/300/200?random=24',
      alt: 'Nori sleeping in the sun',
      title: 'Solar Powered',
      category: 'sleeping',
      date: '2024-02-08',
      description: 'Nori soaking up the sun while sleeping',
      tags: ['sleep', 'sun', 'warm', 'energy'],
      width: 300,
      height: 200
    }
  ];
}

export const categories = ['all', 'sleeping', 'playing', 'eating', 'exploring', 'cuddling'] as const;
