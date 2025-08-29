'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Search, Filter, Heart, Calendar, Tag } from 'lucide-react';
import { NoriPhoto } from '@/data/nori-photos';
import clsx from 'clsx';
import { loadMorePhotos } from '@/app/actions/load-more-photos';

interface PhotoGridProps {
  photos: NoriPhoto[];
  total: number;
  hasMore?: boolean;
}

export const PhotoGrid = ({ photos: initialPhotos, total, hasMore }: PhotoGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | NoriPhoto['category']>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [photos, setPhotos] = useState<NoriPhoto[]>(initialPhotos);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMorePhotos, setHasMorePhotos] = useState(hasMore);

  // Define categories inline to avoid export issues
  const categories = ['all', 'sleeping', 'playing', 'eating', 'exploring', 'cuddling'] as const;

  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || photo.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [photos, searchTerm, selectedCategory]);

  const toggleFavorite = (photoId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(photoId)) {
      newFavorites.delete(photoId);
    } else {
      newFavorites.add(photoId);
    }
    setFavorites(newFavorites);
  };

  const loadMorePhotosHandler = async () => {
    if (loading || !hasMorePhotos) return;
    
    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const result = await loadMorePhotos(nextPage, 50);
      
      if (result.photos && result.photos.length > 0) {
        setPhotos(prev => [...prev, ...result.photos]);
        setCurrentPage(nextPage);
        setHasMorePhotos(result.hasMore);
      }
    } catch (error) {
      console.error('Error loading more photos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Automatically load more photos after initial render
  useEffect(() => {
    if (hasMorePhotos && photos.length < 100) {
      // Load more photos to get a good initial set
      const timer = setTimeout(() => {
        loadMorePhotosHandler();
      }, 1000); // Wait 1 second after initial render
      
      return () => clearTimeout(timer);
    }
  }, []); // Only run once after initial render

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Nori&apos;s World
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              A collection of certified nori moments
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search photos, tags, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as 'all' | NoriPhoto['category'])}
                className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none cursor-pointer"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Photos' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">😿</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No photos found
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    priority={false}
                  />
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(photo.id)}
                    className={clsx(
                      "absolute top-3 right-3 p-2 rounded-full transition-all duration-200",
                      favorites.has(photo.id)
                        ? "bg-red-500 text-white shadow-lg"
                        : "bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-red-500 hover:text-white"
                    )}
                  >
                    <Heart className={clsx("w-5 h-5", favorites.has(photo.id) && "fill-current")} />
                  </button>
                </div>

                {/* Photo Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    {photo.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {photo.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {photo.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Date */}
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(photo.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Load More Button */}
        {hasMorePhotos && (
          <div className="text-center py-8">
            <button
              onClick={loadMorePhotosHandler}
              disabled={loading}
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Load More Photos'}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              {photos.length} of {total} photos loaded
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
