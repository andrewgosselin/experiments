import { Image } from '../Image';
import { VirtualImageColumnClient } from './partials/VirtualImageColumnClient';

interface VirtualImageColumnProps {
  images: string[];
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
  const isUsingStackedImages = images.length > 0 && images[0].includes('nori-stacked');
  
  if (isUsingStackedImages) {
    // For stacked images, treat each as a single tall image
    const stackedItemHeight = 4000; // 20 images × 200px each
    const imageSets = [...images, ...images, ...images]; // Fewer sets since each is tall
    
    return (
      <VirtualImageColumnClient
        direction={direction}
        speed={speed}
        className={className}
        itemHeight={stackedItemHeight}
      >
        {imageSets.map((imageSrc, index) => (
          <div
            key={`${index}-${imageSrc}`}
            className="w-full"
            style={{ height: stackedItemHeight }}
          >
            <Image 
              src={imageSrc} 
              alt={`Stacked Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
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
        {imageSets.map((imageSrc, index) => (
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
        ))}
      </VirtualImageColumnClient>
    );
  }
}
