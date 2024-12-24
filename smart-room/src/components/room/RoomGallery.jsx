import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export default function RoomGallery({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const defaultImage = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267';
  const imageUrls = images?.length > 0 
    ? images.map(img => img.url)
    : [defaultImage];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  return (
    <div className="relative h-96 mb-8">
      <img
        src={imageUrls[currentIndex]}
        alt="Room"
        className="w-full h-full object-cover rounded-lg"
      />
      
      {imageUrls.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  );
} 