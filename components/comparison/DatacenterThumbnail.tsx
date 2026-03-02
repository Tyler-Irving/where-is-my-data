// 'use client' is required: component renders an interactive <button> with an onClick handler.
'use client';

import { X } from 'lucide-react';
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
    <div className="relative flex-shrink-0 bg-white/[0.04] border border-white/[0.08] rounded-xl p-2.5 pr-8 min-w-[150px] max-w-[180px] group hover:border-white/[0.20] transition-all duration-200">
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: displayColor, boxShadow: `0 0 6px ${displayColor}60` }}
          aria-label={`${datacenter.provider} provider`}
          role="img"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white truncate">
            {datacenter.name}
          </p>
          <p className="text-[10px] text-white/40 truncate">
            {datacenter.city}, {datacenter.state}
          </p>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-white/25 hover:text-[#FF3B30] opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-[#FF3B30]/10"
        title={`Remove ${datacenter.name}`}
        aria-label={`Remove ${datacenter.name} from comparison`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
