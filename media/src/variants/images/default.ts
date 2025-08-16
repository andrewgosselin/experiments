import { ImageVariantConfig } from './types';

export const defaultImageVariant: ImageVariantConfig = {
  name: 'default',
  description: 'Default image variant',
  operations: {
    resize: {
        height: 720
    },
    convert: {
        format: 'webp'
    }
  }
};