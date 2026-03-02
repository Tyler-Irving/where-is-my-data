'use client';

import { Zap } from 'lucide-react';
import { Datacenter } from '@/types/datacenter';
import { DatacenterThumbnail } from '@/components/comparison/DatacenterThumbnail';

interface LatencyFooterProps {
  selectedDatacenters: Datacenter[];
  onCalculate: () => void;
  onClearAll: () => void;
  onRemove: (id: string) => void;
}

export function LatencyFooter({
  selectedDatacenters,
  onCalculate,
  onClearAll,
  onRemove,
}: LatencyFooterProps) {
  const count = selectedDatacenters.length;
  const canCalculate = count >= 2;

  if (count === 0) return null;

  return (
    <aside
      role="complementary"
      aria-label="Latency selection footer"
      className="w-full backdrop-blur-xl bg-black/85 border-t border-white/[0.08] shadow-2xl animate-in slide-in-from-bottom duration-300"
    >
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-6 px-6 py-3 max-w-7xl mx-auto">
        {/* Status */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div role="status" aria-live="polite" aria-atomic="true">
            <span className="text-sm font-semibold text-white">
              {count} datacenter{count !== 1 ? 's' : ''} for latency
            </span>
          </div>
          <button
            onClick={onClearAll}
            className="text-xs text-white/35 hover:text-white transition-colors"
            aria-label="Clear all latency selections"
          >
            Clear All
          </button>
        </div>

        {/* Thumbnail carousel */}
        <div
          className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide"
          aria-label="Selected datacenters for latency"
        >
          {selectedDatacenters.map((dc) => (
            <DatacenterThumbnail
              key={dc.id}
              datacenter={dc}
              onRemove={() => onRemove(dc.id)}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onCalculate}
          disabled={!canCalculate}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex-shrink-0 min-w-[180px] justify-center active:scale-[0.97] ${
            canCalculate
              ? 'bg-[#FF9500] hover:bg-[#e08600] text-white shadow-lg shadow-[#FF9500]/20'
              : 'bg-white/[0.05] text-white/25 cursor-not-allowed border border-white/[0.06]'
          }`}
          title={!canCalculate ? 'Select at least 2 datacenters' : undefined}
          aria-label={canCalculate ? 'Calculate latency' : 'Select at least 2 datacenters for latency'}
        >
          <Zap className={`w-4 h-4 ${canCalculate ? '' : 'opacity-30'}`} />
          Calculate Latency
        </button>
      </div>

      {/* Mobile */}
      <div className="md:hidden px-4 py-3 pb-safe">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">
            {count} for latency
          </span>
          <button
            onClick={onClearAll}
            className="text-xs text-white/40 hover:text-white transition-colors min-h-[44px] px-3"
            aria-label="Clear latency selection"
          >
            Clear
          </button>
        </div>
        <button
          onClick={onCalculate}
          disabled={!canCalculate}
          className={`w-full min-h-[52px] py-3 rounded-xl font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
            canCalculate
              ? 'bg-[#FF9500] hover:bg-[#e08600] text-white'
              : 'bg-white/[0.05] text-white/25 border border-white/[0.06]'
          }`}
          aria-label={canCalculate ? 'Calculate latency' : 'Select at least 2 datacenters'}
        >
          <Zap className={`w-4 h-4 ${canCalculate ? '' : 'opacity-30'}`} />
          Calculate Latency
        </button>
      </div>
    </aside>
  );
}
