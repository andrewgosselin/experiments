import React from 'react';
import type { ImageProps as NextImageProps } from 'next/image';
import { IDK_MEDIA_URL } from '../config/asset';

// Check for Next.js availability at module initialization
let NextImageComponent: React.ComponentType<any> | null = null;
try {
  // Using require instead of import since we want synchronous evaluation
  NextImageComponent = require('next/image').default;
} catch (e) {
  // Next.js not available, will use regular img element
  NextImageComponent = null;
}

export interface IDKImageProps extends Omit<NextImageProps, 'src' | 'onError'> {
  id: string;
  variant?: string;
  analytics?: boolean;
  onError?: (error: Error) => void;
}

export const IDKImage: React.FC<IDKImageProps> = ({
  id,
  variant = 'default',
  analytics = true,
  alt = '',
  width,
  height,
  className,
  loading = 'lazy',
  onError,
  ...rest
}) => {
  const handleError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    if (onError) {
      onError(new Error(`Failed to load image: ${IDK_MEDIA_URL}/assets/${id}`));
    }
  };

  const imageUrl = `${IDK_MEDIA_URL}/assets/${id}?v=${variant}&analytics=${analytics}`;

  if (NextImageComponent) {
    return (
      <NextImageComponent
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        onError={handleError}
        unoptimized={rest?.unoptimized ?? true}
        {...rest}
      />
    );
  }

  // Fallback to regular img element
  return (
    <img
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      onError={handleError}
      {...rest}
    />
  );
}; 