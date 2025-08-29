'use client';

import { useState, useRef, useEffect } from 'react';

interface VirtualImageColumnClientProps {
  children: React.ReactNode;
  direction: 'up' | 'down';
  speed: number;
  className: string;
  itemHeight: number;
}

export function VirtualImageColumnClient({ 
  children, 
  direction, 
  speed,
  className,
  itemHeight
}: VirtualImageColumnClientProps) {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(null);
  
  // Auto-scroll animation
  useEffect(() => {
    const animate = () => {
      setScrollY(prev => {
        let newScrollY;
        
        if (direction === 'down') {
          // For down scrolling, we move the images up to create the illusion of images flowing down
          newScrollY = prev - speed / 60;
          // Reset when we've scrolled up one complete set
          if (newScrollY <= -itemHeight * 6) { // 6 sets of images
            newScrollY = 0;
          }
        } else {
          // Up scrolling
          newScrollY = prev - speed / 60;
          // For up scrolling, reset when we've scrolled up one complete set
          if (newScrollY <= -itemHeight * 6) { // 6 sets of images
            newScrollY = 0;
          }
        }
        
        return newScrollY;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [direction, speed, itemHeight]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      <div 
        className="flex flex-col"
        style={{
          transform: `translateY(${scrollY}px)`,
          transition: 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
}
