'use client';

import { useState, useRef, useEffect } from 'react';
import NextImage from 'next/image';
import { ImageProps } from '../types';

export const ImageDisplay = (imageProps: ImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  console.log(imageProps);

  const handleError = () => {
    setHasError(true);
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div 
      ref={imageRef}
      className={`relative w-full h-full bg-gray-100 overflow-hidden ${imageProps.className || ''}`}
    >
      {hasError ? (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-1">⚠️</div>
            <div className="text-gray-500 text-sm">Failed to load</div>
          </div>
        </div>
      ) : (
        <NextImage
          {...imageProps}
          fill={true}
          placeholder="blur"
          blurDataURL={imageProps.blurDataURL || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='}
          className={`object-cover`}
          onError={handleError}
          onLoad={handleLoad}
          loading="lazy"
        />
      )}
    </div>
  );
}
