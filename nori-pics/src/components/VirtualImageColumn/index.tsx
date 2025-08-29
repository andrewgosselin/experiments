import { Image } from '../Image';
import { VirtualImageColumnClient } from './partials/VirtualImageColumnClient';

interface VirtualImageColumnProps {
  images: string[] | Array<{ src: string; blurhash: string; width: number; height: number }>;
  direction: 'up' | 'down';
  speed?: number;
  className?: string;
}

export default function VirtualImageColumn({ 
  images, 
  direction, 
  speed = 20,
  className = ''
}: VirtualImageColumnProps) {
  // Check if we're using stacked images (they contain "nori-stacked" in the path)
  const isUsingStackedImages = images.length > 0 && 
    (typeof images[0] === 'string' ? images[0].includes('nori-stacked') : images[0].src.includes('nori-stacked'));
  
  if (isUsingStackedImages) {
    // For stacked images, treat each as a single tall image
    const stackedItemHeight = 5000; // 20 images × 250px each
    const imageSets = [...images, ...images, ...images]; // Fewer sets since each is tall
    
    return (
      <VirtualImageColumnClient
        direction={direction}
        speed={speed}
        className={className}
        itemHeight={stackedItemHeight}
      >
        {imageSets.map((image, index) => {
          const imageSrc = typeof image === 'string' ? image : image.src;
          const imageBlurhash = typeof image === 'string' ? undefined : image.blurhash;
          
          return (
            <div
              key={`${index}-${imageSrc}`}
              className="w-full"
              style={{ height: stackedItemHeight }}
            >
              <Image 
                src={imageSrc} 
                alt={`Stacked Image ${index + 1}`}
                className="w-full h-full object-cover"
                blurDataURL={imageBlurhash}
                placeholder="blur"
              />
            </div>
          );
        })}
      </VirtualImageColumnClient>
    );
  } else {
    // Original behavior for individual images
    const itemHeight = 200;
    const imageSets = [...images, ...images, ...images, ...images, ...images, ...images];
    
    return (
      <VirtualImageColumnClient
        direction={direction}
        speed={speed}
        className={className}
        itemHeight={itemHeight}
      >
        {imageSets.map((image, index) => {
          const imageSrc = typeof image === 'string' ? image : image.src;
          
          return (
            <div
              key={`${index}-${imageSrc}`}
              className="w-full"
              style={{ height: itemHeight }}
            >
              <Image 
                src={imageSrc} 
                alt={`Image ${index + 1}`}
                className="w-full h-full"
              />
            </div>
          );
        })}
      </VirtualImageColumnClient>
    );
  }
}
