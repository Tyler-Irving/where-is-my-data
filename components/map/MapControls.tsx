'use client';

import React from 'react';
import { useMapStore } from '@/store/mapStore';

export const MapControls = React.memo(function MapControls() {
  const { viewport, setViewport } = useMapStore();

  const handleZoomIn = () => {
    setViewport({ zoom: Math.min(viewport.zoom + 1, 20) });
  };

  const handleZoomOut = () => {
    setViewport({ zoom: Math.max(viewport.zoom - 1, 0) });
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 flex flex-col shadow-md z-30">
      <button
        onClick={handleZoomIn}
        className="w-12 h-12 sm:w-10 sm:h-10 bg-gray-900 border border-gray-700 rounded-t-lg hover:bg-gray-800 active:bg-gray-700 flex items-center justify-center text-white text-2xl sm:text-xl font-medium transition-colors touch-manipulation"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        onClick={handleZoomOut}
        className="w-12 h-12 sm:w-10 sm:h-10 bg-gray-900 border border-gray-700 rounded-b-lg hover:bg-gray-800 active:bg-gray-700 flex items-center justify-center text-white text-2xl sm:text-xl font-medium border-t-0 transition-colors touch-manipulation"
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  );
});
