import Link from 'next/link';
import VirtualImageColumn from '../components/VirtualImageColumn';
import { getStackedImages } from '../data/nori-photos';
import AnimatedHandwritingText from '../components/AnimatedHandwritingText';

export default async function Home() {
  // Get stacked composite images for background columns (much faster!)
  const { stackedImages, total: totalImages } = await getStackedImages();
  
  // Debug: Check what we're getting
  console.log('=== STACKED IMAGES DEBUG ===');
  console.log('Total images:', totalImages);
  console.log('Stacked images count:', stackedImages.length);
  console.log('First few stacked images:', stackedImages.slice(0, 3));
  
  // Extract just the src paths for distribution
  const stackedImagePaths = stackedImages.map(img => img.src);
  console.log('Stacked images paths:', stackedImagePaths);
  
  // Distribute stacked images evenly across 4 columns
  const totalStackedImages = stackedImagePaths.length;
  console.log(`Distributing ${totalStackedImages} stacked images across 4 columns`);
  
  // For better distribution, let's use a round-robin approach
  const redImages: string[] = [];
  const blueImages: string[] = [];
  const greenImages: string[] = [];
  const yellowImages: string[] = [];
  
  stackedImagePaths.forEach((imagePath, index) => {
    const columnIndex = index % 4;
    switch (columnIndex) {
      case 0:
        redImages.push(imagePath);
        break;
      case 1:
        blueImages.push(imagePath);
        break;
      case 2:
        greenImages.push(imagePath);
        break;
      case 3:
        yellowImages.push(imagePath);
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
    <div className="relative w-full min-h-screen bg-black">
      {/* Hero section with background columns */}
      <div className="relative w-full h-[calc(100vh+100px)] ">
        {/* Background columns with virtual image stacks */}
        <div className="absolute inset-0 flex w-full h-full bg-black">
          {/* Red column - moving down, shorter height */}
          <div 
            className="hidden sm:block flex-1 h-[calc(100vh)] bg-red-500 relative overflow-hidden"
          >
            <VirtualImageColumn 
              images={redImages}
              direction="down"
              speed={30}
              className="w-full h-full"
            />
            {/* Fade out overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
          </div>
          
          {/* Blue column - moving up, longer height */}
          <div 
            className="flex-1 h-[calc(100vh+100px)] bg-blue-500 relative overflow-hidden"
          >
            <VirtualImageColumn 
              images={blueImages}
              direction="up"
              speed={25}
              className="w-full h-full"
            />
            {/* Fade out overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
          </div>
          
          {/* Green column - moving down, shorter height */}
          <div 
            className="flex-1 h-[calc(100vh)] bg-green-500 relative overflow-hidden"
          >
            <VirtualImageColumn 
              images={greenImages}
              direction="down"
              speed={35}
              className="w-full h-full"
            />
            {/* Fade out overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
          </div>
          
          {/* Yellow column - moving up, longer height */}
          <div 
            className="hidden sm:block flex-1 h-[calc(100vh+100px)] bg-yellow-500 relative overflow-hidden"
          >
            <VirtualImageColumn 
              images={yellowImages}
              direction="up"
              speed={28}
              className="w-full h-full"
            />
            {/* Fade out overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
          </div>
        </div>
        
        {/* Centered content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
          <div className="text-center">
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-black text-white mb-8 drop-shadow-2xl shadow-black/50 bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent filter drop-shadow-[0_0_30px_rgba(0,0,0,0.9)] drop-shadow-[0_0_60px_rgba(0,0,0,0.7)]">
              Nori Pics
            </h1>
            <div className="text-center">
              <div className="mb-3">
                <AnimatedHandwritingText text="Scroll down for highlights" />
              </div>
              <div className="animate-bounce">
                <svg className="w-6 h-6 mx-auto text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured sections below hero */}
      <div className="bg-black text-white py-40">
        <div className="max-w-7xl mx-auto px-6 relative">
          {/* Center line for desktop - only covers highlights sections */}
          <div className="hidden lg:block absolute left-1/2 top-0 h-full w-px bg-gray-700" style={{ height: 'calc(100% - 80px)' }}></div>
          
          {/* The Thinker Section - Left Side */}
          <div className="mb-20 lg:mb-32">
            {/* Mobile separator dot */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            </div>
            
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
              {/* Mobile: Image first, then text */}
              <div className="lg:hidden mb-6">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-2xl">
                  <img 
                    src="/assets/images/nori/IMG_9369.JPEG" 
                    alt="The Thinker - Nori in a thoughtful pose"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="lg:col-start-1 lg:col-end-2 lg:text-right lg:pr-8">
                <h2 className="text-4xl font-bold mb-6 text-center lg:text-right">The Thinker</h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6 text-center lg:text-right">
                  A contemplative moment captured in time. Nori sits in deep thought, 
                  perhaps pondering the mysteries of life, or maybe just wondering 
                  where the next treat is coming from.
                </p>
              </div>
              <div className="lg:col-start-2 lg:col-end-3 lg:pl-8 mt-8 lg:mt-0 hidden lg:block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-2xl">
                  <img 
                    src="/assets/images/nori/IMG_9369.JPEG" 
                    alt="The Thinker - Nori in a thoughtful pose"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Somber Night Section - Right Side */}
          <div className="mb-20 lg:mb-32">
            {/* Mobile separator dot */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            </div>
            
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
              {/* Mobile: Image first, then text */}
              <div className="lg:hidden mb-6">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-2xl">
                  <img 
                    src="/assets/images/nori/IMG_0323.JPEG" 
                    alt="Somber Night - Nori in a contemplative evening mood"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="lg:col-start-1 lg:col-end-2 lg:pl-8 hidden lg:block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-2xl">
                  <img 
                    src="/assets/images/nori/IMG_0323.JPEG" 
                    alt="Somber Night - Nori in a contemplative evening mood"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="lg:col-start-2 lg:col-end-3 lg:text-left lg:pl-8 mt-8 lg:mt-0">
                <h2 className="text-4xl font-bold mb-6 text-center lg:text-left">Somber Night</h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6 text-center lg:text-left">
                  A serene evening moment where Nori embraces the quiet solitude of night. 
                  The soft lighting captures a more introspective side, showing the depth 
                  and complexity of this beloved companion.
                </p>
              </div>
            </div>
          </div>
          
          {/* Titanic Reference Section - Left Side */}
          <div className="mb-20 lg:mb-32">
            {/* Mobile separator dot */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            </div>
            
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
              {/* Mobile: Image first, then text */}
              <div className="lg:hidden mb-6">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-2xl">
                  <img 
                    src="/assets/images/nori/IMG_9941.JPEG" 
                    alt="Nori hanging onto a chair like Jack holding the door in Titanic"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="lg:col-start-1 lg:col-end-2 lg:text-right lg:pr-8">
                <h2 className="text-4xl font-bold mb-6 text-center lg:text-right">&ldquo;I&apos;ll Never Let Go&rdquo;</h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6 text-center lg:text-right">
                  In this dramatic moment, Nori demonstrates the same determination as Jack 
                  holding onto that door. Clinging to the chair with unwavering resolve, 
                  proving that some bonds are simply unbreakable.
                </p>
              </div>
              <div className="lg:col-start-2 lg:col-end-3 lg:pl-8 mt-8 lg:mt-0 hidden lg:block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-2xl">
                  <img 
                    src="/assets/images/nori/IMG_9941.JPEG" 
                    alt="Nori hanging onto a chair like Jack holding the door in Titanic"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Learning to Stand Section - Right Side */}
          <div className="mb-20 lg:mb-32">
            {/* Mobile separator dot */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            </div>
            
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
              {/* Mobile: Image first, then text */}
              <div className="lg:hidden mb-6">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-2xl">
                  <img 
                    src="/assets/images/nori/IMG_9485.JPG" 
                    alt="Nori learning to stand on two legs"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="lg:col-start-1 lg:col-end-2 lg:pl-8 hidden lg:block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-2xl">
                  <img 
                    src="/assets/images/nori/IMG_9485.JPG" 
                    alt="Nori learning to stand on two legs"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="lg:col-start-2 lg:col-end-3 lg:text-left lg:pl-8 mt-8 lg:mt-0">
                <h2 className="text-4xl font-bold mb-6 text-center lg:text-left">Learning to Stand</h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6 text-center lg:text-left">
                  A proud moment of progress as Nori discovers the art of standing on two legs. 
                  Every small step forward in learning is a testament to determination and growth, 
                  showing that even the most basic skills are worth celebrating.
                </p>
              </div>
            </div>
          </div>
          
          {/* Gluttony and Greed Section - Left Side */}
          <div className="mb-20 lg:mb-32">
            {/* Mobile separator dot */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            </div>
            
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
              {/* Mobile: Image first, then text */}
              <div className="lg:hidden mb-6">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-2xl">
                  <img 
                    src="/assets/images/nori/IMG_9741.JPG" 
                    alt="Nori eating a chip with gluttonous enthusiasm"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="lg:col-start-1 lg:col-end-2 lg:text-right lg:pr-8">
                <h2 className="text-4xl font-bold mb-6 text-center lg:text-right">Gluttony and Greed</h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6 text-center lg:text-right">
                  The moment of pure indulgence as Nori succumbs to the irresistible allure of a chip. 
                  A perfect example of how even the most dignified creatures can become 
                  completely consumed by the simple pleasures of life.
                </p>
              </div>
              <div className="lg:col-start-2 lg:col-end-3 lg:pl-8 mt-8 lg:mt-0 hidden lg:block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-2xl">
                  <img 
                    src="/assets/images/nori/IMG_9741.JPG" 
                    alt="Nori eating a chip with gluttonous enthusiasm"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Dark Souls Reference Section - Right Side */}
          <div className="mb-20 lg:mb-32">
            {/* Mobile separator dot */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            </div>
            
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
              {/* Mobile: Image first, then text */}
              <div className="lg:hidden mb-6">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-2xl">
                  <img 
                    src="/assets/images/nori/IMG_9162.JPEG" 
                    alt="Nori in a dramatic pose reminiscent of Dark Souls death screen"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="lg:col-start-1 lg:col-end-2 lg:pl-8 hidden lg:block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-2xl">
                  <img 
                    src="/assets/images/nori/IMG_9162.JPEG" 
                    alt="Nori in a dramatic pose reminiscent of Dark Souls death screen"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="lg:col-start-2 lg:col-end-3 lg:text-left lg:pl-8 mt-8 lg:mt-0">
                <h2 className="text-4xl font-bold mb-6 text-center lg:text-left">YOU DIED</h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-6 text-center lg:text-left">
                  The inevitable moment arrives. Nori has fallen in battle, defeated by the 
                  cruel challenges of life. But fear not, for this is not the end - 
                  only the beginning of another attempt to overcome the odds.
                </p>
              </div>
            </div>
          </div>
        </div>
                  {/* View Gallery Section */}
            <div className="text-center py-20">
            <h2 className="text-4xl font-bold mb-8">Explore the Full Collection</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover hundreds of precious moments captured in Nori&apos;s daily adventures
            </p>
            <Link 
              href="/gallery" 
              className="inline-block px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg shadow-lg"
            >
              View Gallery
            </Link>
          </div>
      </div>
    </div>
  );
}
