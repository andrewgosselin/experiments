import { getNoriPhotos } from '@/data/nori-photos';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PhotoGrid } from '@/components/PhotoGrid';

export default async function GalleryPage() {
  const noriPhotos = await getNoriPhotos();
  console.log(noriPhotos);
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Back Button */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Masonry View
          </Link>
        </div>
      </div>

      <PhotoGrid photos={noriPhotos} />
    </div>
  );
}
