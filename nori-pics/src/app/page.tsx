import Link from 'next/link';
import VirtualImageColumn from '../components/VirtualImageColumn';
import { getNoriPhotos } from '../data/nori-photos';

export default async function Home() {
  // Get the nori photos using the cached function
  const noriPhotos = await getNoriPhotos();
  
  // Calculate even distribution based on actual length
  const totalImages = noriPhotos.length;
  const imagesPerColumn = Math.ceil(totalImages / 4);
  
  // Split the noriPhotos array into 4 parts for each column
  const redImages = noriPhotos.slice(0, imagesPerColumn).map(photo => photo.src);
  const blueImages = noriPhotos.slice(imagesPerColumn, imagesPerColumn * 2).map(photo => photo.src);
  const greenImages = noriPhotos.slice(imagesPerColumn * 2, imagesPerColumn * 3).map(photo => photo.src);
  const yellowImages = noriPhotos.slice(imagesPerColumn * 3).map(photo => photo.src);
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
