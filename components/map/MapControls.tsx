'use client';

import React from 'react';
import { useMapStore } from '@/store/mapStore';

export const MapControls = React.memo(function MapControls() {
  const { viewport, setViewport } = useMapStore();

  const btnClass = 'w-10 h-10 glass flex items-center justify-center text-white/60 hover:text-white text-xl font-medium transition-all duration-200 hover:bg-white/[0.10] active:scale-95 touch-manipulation';

  return (
    <div className="fixed bottom-24 right-4 sm:right-5 flex flex-col gap-1 z-30">
      <button
        onClick={() => setViewport({ zoom: Math.min(viewport.zoom + 1, 20) })}
        className={`${btnClass} rounded-t-xl`}
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        onClick={() => setViewport({ zoom: Math.max(viewport.zoom - 1, 0) })}
        className={`${btnClass} rounded-b-xl border-t border-white/[0.06]`}
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  );
});
