import { ImageVariantConfig } from './types';

export const thumbnailVariant: ImageVariantConfig = {
  name: 'thumbnail',
  description: 'Generates a thumbnail for the image',
  operations: {
    resize: {
      height: 100,
      width: 100,
      fit: 'cover',
      position: 'center'
    }
  }
};