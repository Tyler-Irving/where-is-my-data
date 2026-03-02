'use client';

import { ArrowRight } from 'lucide-react';
import { Datacenter } from '@/types/datacenter';
import { DatacenterThumbnail } from './DatacenterThumbnail';
import { Button } from '@/components/ui/button';

interface ComparisonFooterProps {
  selectedDatacenters: Datacenter[];
  onViewComparison: () => void;
  onClearAll: () => void;
  onRemove: (id: string) => void;
}

export function ComparisonFooter({
  selectedDatacenters,
  onViewComparison,
  onClearAll,
  onRemove,
}: ComparisonFooterProps) {
  const count = selectedDatacenters.length;
  const canCompare = count >= 2;
  const atMax = count >= 3;

  if (count === 0) return null;

  return (
    <aside
      role="complementary"
      aria-label="Comparison selection footer"
      className="w-full backdrop-blur-xl bg-black/85 border-t border-white/[0.08] shadow-2xl animate-in slide-in-from-bottom duration-300"
    >
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-6 px-6 py-3 max-w-7xl mx-auto">
        {/* Status */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div role="status" aria-live="polite" aria-atomic="true">
            <span className="text-sm font-semibold text-white">
              {count} datacenter{count !== 1 ? 's' : ''} selected
            </span>
            {atMax && (
              <span className="text-[#FF9500] text-xs font-medium ml-2">(max)</span>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={onClearAll}
            className="text-xs text-white/35 hover:text-white h-auto p-0"
            aria-label="Clear all selected datacenters"
          >
            Clear All
          </Button>
        </div>

        {/* Thumbnail carousel */}
        <div
          className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide"
          aria-label="Selected datacenters"
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
        <Button
          onClick={onViewComparison}
          disabled={!canCompare}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex-shrink-0 min-w-[160px] justify-center active:scale-[0.97] h-auto ${
            canCompare
              ? 'bg-[#0066FF] hover:bg-[#0052cc] text-white shadow-lg shadow-[#0066FF]/20'
              : 'bg-white/[0.05] text-white/25 cursor-not-allowed border border-white/[0.06]'
          }`}
          title={!canCompare ? 'Select at least 2 datacenters' : undefined}
          aria-label={canCompare ? 'View comparison' : 'Select at least 2 datacenters to compare'}
        >
          View Comparison
          <ArrowRight className={`w-4 h-4 ${canCompare ? '' : 'opacity-30'}`} />
        </Button>
      </div>

      {/* Mobile */}
      <div className="md:hidden px-4 py-3 pb-safe">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">
            {count} selected
            {atMax && <span className="text-[#FF9500] text-xs ml-1.5">(max)</span>}
          </span>
          <Button
            variant="ghost"
            onClick={onClearAll}
            className="text-xs text-white/40 hover:text-white min-h-[44px] px-3 h-auto"
            aria-label="Clear all"
          >
            Clear
          </Button>
        </div>
        <Button
          onClick={onViewComparison}
          disabled={!canCompare}
          className={`w-full min-h-[52px] py-3 rounded-xl font-bold text-base transition-all active:scale-[0.98] h-auto ${
            canCompare
              ? 'bg-[#0066FF] hover:bg-[#0052cc] text-white'
              : 'bg-white/[0.05] text-white/25 border border-white/[0.06]'
          }`}
          aria-label={canCompare ? 'View comparison' : 'Select at least 2 datacenters'}
        >
          View Comparison
        </Button>
      </div>
    </aside>
  );
}
