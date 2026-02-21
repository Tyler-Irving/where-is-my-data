'use client';

import { Datacenter } from '@/types/datacenter';
import { getProviderColor } from '@/lib/utils/providerColors';
import { getDisplayColor } from '@/lib/utils/colorBrightness';

interface DatacenterThumbnailProps {
  datacenter: Datacenter;
  onRemove: () => void;
}

export function DatacenterThumbnail({ datacenter, onRemove }: DatacenterThumbnailProps) {
  const providerColor = getProviderColor(datacenter.provider);
  const displayColor = getDisplayColor(providerColor);
  
  return (
    <div className="relative flex-shrink-0 bg-zinc-800 rounded-lg p-2 pr-8 border border-zinc-700 hover:border-zinc-600 transition-all group min-w-[160px] max-w-[200px] h-14">
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ 
            backgroundColor: displayColor, 
            boxShadow: `0 0 4px ${displayColor}` 
          }}
          aria-label={`${datacenter.provider} provider`}
          role="img"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-white truncate">
            {datacenter.name}
          </div>
          <div className="text-[10px] text-zinc-400 truncate">
            {datacenter.city}, {datacenter.state}
          </div>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-red-400/10"
        title={`Remove ${datacenter.name}`}
        aria-label={`Remove ${datacenter.name} from comparison`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
