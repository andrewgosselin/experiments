'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedHandwritingTextProps {
  text: string;
  className?: string;
}

export default function AnimatedHandwritingText({ text, className = '' }: AnimatedHandwritingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const varaRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && containerRef.current) {
      // Clear any existing content first
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      
      // Dynamically import Vara to avoid SSR issues
      import('vara').then(({ default: Vara }) => {
        // Store reference to clean up later
        varaRef.current = new Vara(
          "#vara-container",
          "https://raw.githubusercontent.com/akzhy/Vara/master/fonts/Satisfy/SatisfySL.json",
          [
            {
              text: text,
              fontSize: 24,
              strokeWidth: 1.5,
              color: "rgba(255, 255, 255, 1)",
              duration: 2000,
              textAlign: "center",
            },
          ]
        );
      });
    }

    // Cleanup function
    return () => {
      if (varaRef.current && typeof varaRef.current.destroy === 'function') {
        varaRef.current.destroy();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [text, isClient]);

  return (
    <div 
      id="vara-container"
      ref={containerRef} 
      className={className}
      style={{
        filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.9)) drop-shadow(0 0 40px rgba(0,0,0,0.7))',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
      }}
    ></div>
  );
}
