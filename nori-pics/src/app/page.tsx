import Link from 'next/link';
import VirtualImageColumn from '../components/VirtualImageColumn';
import { getStackedImages } from '../data/nori-photos';

export default async function Home() {
  // Get stacked composite images for background columns (much faster!)
  const { stackedImages, total: totalImages } = await getStackedImages();
  
  // Debug: Check what we're getting
  console.log('=== STACKED IMAGES DEBUG ===');
  console.log('Total images:', totalImages);
  console.log('Stacked images count:', stackedImages.length);
  console.log('First few stacked images:', stackedImages.slice(0, 3));
  console.log('Stacked images paths:', stackedImages);
  
  // Distribute stacked images evenly across 4 columns
  const totalStackedImages = stackedImages.length;
  console.log(`Distributing ${totalStackedImages} stacked images across 4 columns`);
  
  // For better distribution, let's use a round-robin approach
  const redImages: string[] = [];
  const blueImages: string[] = [];
  const greenImages: string[] = [];
  const yellowImages: string[] = [];
  
  stackedImages.forEach((image, index) => {
    const columnIndex = index % 4;
    switch (columnIndex) {
      case 0:
        redImages.push(image);
        break;
      case 1:
        blueImages.push(image);
        break;
      case 2:
        greenImages.push(image);
        break;
      case 3:
        yellowImages.push(image);
        break;
    }
  });
  
  console.log(`Column distribution: Red=${redImages.length}, Blue=${blueImages.length}, Green=${greenImages.length}, Yellow=${yellowImages.length}`);
  console.log('Red column images:', redImages);
  console.log('Blue column images:', blueImages);
  console.log('Green column images:', greenImages);
  console.log('Yellow column images:', yellowImages);
  console.log('=== END DEBUG ===');
  return (
    <div className="relative w-full h-screen min-h-screen overflow-hidden">
      {/* Background columns with virtual image stacks */}
      <div className="absolute inset-0 flex w-full h-full">
        {/* Red column - moving down */}
        <div 
          className="flex-1 h-full bg-red-500 relative overflow-hidden"
        >
          <VirtualImageColumn 
            images={redImages}
            direction="down"
            speed={30}
            className="w-full h-full"
          />
        </div>
        
        {/* Blue column - moving up */}
        <div 
          className="flex-1 h-full bg-blue-500 relative overflow-hidden"
        >
          <VirtualImageColumn 
            images={blueImages}
            direction="up"
            speed={25}
            className="w-full h-full"
          />
        </div>
        
        {/* Green column - moving down */}
        <div 
          className="flex-1 h-full bg-green-500 relative overflow-hidden"
        >
          <VirtualImageColumn 
            images={greenImages}
            direction="down"
            speed={35}
            className="w-full h-full"
          />
        </div>
        
        {/* Yellow column - moving up */}
        <div 
          className="flex-1 h-full bg-yellow-500 relative overflow-hidden"
        >
          <VirtualImageColumn 
            images={yellowImages}
            direction="up"
            speed={28}
            className="w-full h-full"
          />
        </div>
      </div>
      
      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h1 className="text-7xl font-black text-white mb-8 drop-shadow-2xl shadow-black/50 bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
          Nori Pics
        </h1>
        <Link href="/gallery" className="px-6 py-3 bg-white text-gray-800 rounded-lg shadow-lg hover:bg-gray-100 transition-colors">
          View Gallery
        </Link>
      </div>
    </div>
  );
}
