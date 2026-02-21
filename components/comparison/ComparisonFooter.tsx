'use client';

import { Datacenter } from '@/types/datacenter';
import { DatacenterThumbnail } from './DatacenterThumbnail';

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
  onRemove
}: ComparisonFooterProps) {
  const count = selectedDatacenters.length;
  const canCompare = count >= 2;
  const atMax = count >= 3;
  
  if (count === 0) return null; // Hidden when empty
  
  return (
    <aside
      role="complementary"
      aria-label="Comparison selection footer"
      className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-700 shadow-2xl animate-in slide-in-from-bottom duration-300"
    >
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between px-6 py-4 max-w-7xl mx-auto gap-6">
        {/* Left Section - Selection Info */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div role="status" aria-live="polite" aria-atomic="true">
            <span className="text-white font-medium text-sm">
              {count} datacenter{count !== 1 ? 's' : ''} selected
            </span>
            {atMax && (
              <span className="text-amber-400 ml-2 text-sm font-medium">(max)</span>
            )}
          </div>
          <button
            onClick={onClearAll}
            className="text-sm text-zinc-400 hover:text-white transition-colors hover:underline"
            aria-label="Clear all selected datacenters"
          >
            Clear All
          </button>
        </div>
        
        {/* Center Section - Thumbnail Carousel */}
        <div 
          className="flex items-center gap-3 flex-1 max-w-2xl overflow-x-auto scrollbar-hide"
          aria-label="Selected datacenters"
        >
          {selectedDatacenters.map(dc => (
            <DatacenterThumbnail
              key={dc.id}
              datacenter={dc}
              onRemove={() => onRemove(dc.id)}
            />
          ))}
        </div>
        
        {/* Right Section - CTA Button */}
        <button
          onClick={onViewComparison}
          disabled={!canCompare}
          className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 flex-shrink-0 min-w-[180px] justify-center ${
            canCompare
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98]'
              : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
          }`}
          title={!canCompare ? 'Select at least 2 datacenters to compare' : 'View comparison of selected datacenters'}
          aria-label={canCompare 
            ? 'View comparison of selected datacenters' 
            : 'View Comparison - disabled, select at least 2 datacenters'}
        >
          View Comparison
          <svg 
            className={`w-4 h-4 transition-transform ${canCompare ? 'group-hover:translate-x-0.5' : 'opacity-50'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Layout */}
      <div className="md:hidden px-4 py-3 pb-safe">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white text-sm font-medium">
            {count} selected {atMax && <span className="text-amber-400">(max)</span>}
          </span>
          <button 
            onClick={onClearAll} 
            className="text-xs text-zinc-400 hover:text-white transition-colors min-h-[48px] px-3"
            aria-label="Clear all selected datacenters"
          >
            Clear
          </button>
        </div>
        <button
          onClick={onViewComparison}
          disabled={!canCompare}
          className={`w-full min-h-[56px] py-3 rounded-lg font-semibold text-base transition-all ${
            canCompare
              ? 'bg-blue-600 text-white active:bg-blue-700'
              : 'bg-zinc-700 text-zinc-500'
          }`}
          aria-label={canCompare 
            ? 'View comparison' 
            : 'View Comparison - select at least 2 datacenters'}
        >
          View Comparison
        </button>
      </div>
    </aside>
  );
}
