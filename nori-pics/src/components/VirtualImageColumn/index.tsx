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
  const itemHeight = 200;
  
  // Render multiple sets of images for seamless looping on the server
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
