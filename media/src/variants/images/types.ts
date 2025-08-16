export interface ImageVariantConfig {
  name: string;
  description: string;
  operations?: {
    resize?: {
      width?: number;
      height?: number;
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
      position?: 'center' | 'top' | 'right top' | 'right' | 'right bottom' | 'bottom' | 'left bottom' | 'left' | 'left top';
    };
    convert?: {
      format: 'jpeg' | 'png' | 'webp' | 'avif' | 'gif';
    };
    blurhash?: {
      componentsX?: number;
      componentsY?: number;
    };
  };
} 