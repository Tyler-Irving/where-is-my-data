'use client';

import React, { useState } from 'react';
import { getAllProviders } from '@/lib/utils/providerColors';
import { getDisplayColor } from '@/lib/utils/colorBrightness';

export const MapLegend = React.memo(function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false);
  const providers = getAllProviders();

  // Group providers by type
  const providersByType = providers.reduce((acc, provider) => {
    if (!acc[provider.type]) {
      acc[provider.type] = [];
    }
    acc[provider.type].push(provider);
    return acc;
  }, {} as Record<string, typeof providers>);

  const typeLabels: Record<string, string> = {
    'hyperscale-cloud': 'Hyperscale Cloud',
    'colocation': 'Colocation',
    'tech-giant': 'Tech Giants',
    'regional-cloud': 'Regional Cloud',
    'edge-cdn': 'Edge / CDN',
  };

  return (
    <div className="hidden sm:block fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-30">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
        {/* Header (always visible) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between hover:bg-gray-800 transition-colors touch-manipulation"
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex gap-0.5 sm:gap-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: '#FF9900' }} />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: '#0078D4' }} />
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: '#4285F4' }} />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-white">Providers</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="max-h-[60vh] overflow-y-auto border-t border-gray-700">
            {Object.entries(providersByType).map(([type, typeProviders]) => (
              <div key={type} className="border-b border-gray-800 last:border-b-0">
                {/* Type header */}
                <div className="px-3 py-1.5 bg-gray-800">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {typeLabels[type] || type}
                  </span>
                </div>
                
                {/* Providers in this type */}
                <div className="px-3 py-2 space-y-1.5">
                  {typeProviders.map((provider) => {
                    const displayColor = getDisplayColor(provider.color);
                    return (
                      <div key={provider.id} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full border border-white/10 flex-shrink-0"
                          style={{ 
                            backgroundColor: displayColor,
                            boxShadow: `0 0 4px ${displayColor}`
                          }}
                        />
                        <span className="text-xs text-gray-300">{provider.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Footer stats */}
            <div className="px-3 py-2 bg-gray-800 border-t border-gray-700">
              <p className="text-[10px] text-gray-400">
                {providers.length} providers • 105 locations
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
