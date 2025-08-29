'use server';

import { getNoriPhotosPaginated } from '@/data/nori-photos';

export async function loadMorePhotos(page: number, limit: number = 50) {
  try {
    const result = await getNoriPhotosPaginated(page, limit);
    return result;
  } catch (error) {
    console.error('Error loading more photos:', error);
    return { photos: [], total: 0, hasMore: false };
  }
}
