'use client';

import React, { useState } from 'react';
import { getAllProviders } from '@/lib/utils/providerColors';
import { getDisplayColor } from '@/lib/utils/colorBrightness';
import { ChevronDown } from 'lucide-react';

export const MapLegend = React.memo(function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false);
  const providers = getAllProviders();

  const providersByType = providers.reduce((acc, provider) => {
    if (!acc[provider.type]) acc[provider.type] = [];
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
    <div className="hidden lg:block fixed bottom-6 left-4 z-30">
      <div className="glass rounded-2xl overflow-hidden w-52 shadow-2xl">
        {/* Header toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse legend' : 'Expand legend'}
          aria-expanded={isExpanded}
          className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-white/[0.05] transition-colors touch-manipulation"
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FF9900' }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0078D4' }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4285F4' }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">Providers</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-white/25 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {isExpanded && (
          <div className="border-t border-white/[0.06] max-h-[55vh] overflow-y-auto scrollbar-hide">
            {Object.entries(providersByType).map(([type, typeProviders]) => (
              <div key={type} className="border-b border-white/[0.04] last:border-b-0">
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">
                    {typeLabels[type] || type}
                  </span>
                </div>
                <div className="px-3 pb-2 space-y-1.5">
                  {typeProviders.map((provider) => {
                    const displayColor = getDisplayColor(provider.color);
                    return (
                      <div key={provider.id} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: displayColor, boxShadow: `0 0 4px ${displayColor}` }} />
                        <span className="text-xs text-white/50 truncate">{provider.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="px-3 py-2 border-t border-white/[0.06]">
              <p className="text-[9px] text-white/20">{providers.length} providers · 131 locations</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
