'use client';

import React from 'react';
import { X, BarChart3 } from 'lucide-react';
import { Datacenter } from '@/types/datacenter';
import { getProviderColor } from '@/lib/utils/providerColors';
import { getDisplayColor } from '@/lib/utils/colorBrightness';
import { Dialog, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import { Dialog as DialogPrimitive } from 'radix-ui';

interface ComparisonModalProps {
  datacenters: Datacenter[];
  onClose: () => void;
  onRemove: (id: string) => void;
}

export const ComparisonModal = React.memo(function ComparisonModal({
  datacenters,
  onClose,
  onRemove,
}: ComparisonModalProps) {
  if (datacenters.length === 0) return null;

  const fields = [
    { label: 'Provider', key: 'provider' },
    { label: 'Location', key: 'location' },
    { label: 'Capacity (MW)', key: 'capacity' },
    { label: 'PUE', key: 'pue' },
    { label: 'Renewable Energy', key: 'renewable' },
    { label: 'Opened', key: 'opened' },
    { label: 'Availability Zones', key: 'azs' },
    { label: 'Region', key: 'region' },
  ];

  const getValue = (dc: Datacenter, key: string): string => {
    switch (key) {
      case 'provider': return dc.provider;
      case 'location': return `${dc.city ?? '—'}, ${dc.state}`;
      case 'capacity': return dc.metadata?.capacityMW ? `${dc.metadata.capacityMW} MW` : 'N/A';
      case 'pue': return dc.metadata?.pue ? dc.metadata.pue.toFixed(2) : 'N/A';
      case 'renewable': return dc.metadata?.renewable ? '✓ Yes' : '✗ No';
      case 'opened': return dc.metadata?.opened?.toString() ?? 'N/A';
      case 'azs': return dc.metadata?.availabilityZones?.toString() ?? 'N/A';
      case 'region': return dc.metadata?.region?.replace(/-/g, ' ') ?? 'N/A';
      default: return 'N/A';
    }
  };

  const getValueClass = (key: string, val: string) => {
    if (key === 'renewable') {
      return val === '✓ Yes'
        ? 'text-sm font-semibold text-[#00D084]'
        : 'text-sm text-white/35';
    }
    if (key === 'pue' && val !== 'N/A') {
      const pue = parseFloat(val);
      if (pue < 1.2) return 'text-sm font-semibold text-[#00D084]';
      if (pue < 1.4) return 'text-sm font-semibold text-[#FF9500]';
      return 'text-sm font-semibold text-[#FF3B30]';
    }
    return 'text-sm text-white/70';
  };

  // Summary stats
  const pueValues = datacenters
    .map(dc => dc.metadata?.pue)
    .filter((p): p is number => p != null);
  const bestPue = pueValues.length > 0 ? Math.min(...pueValues) : null;
  const renewableCount = datacenters.filter(dc => dc.metadata?.renewable).length;

  // Grid columns: 2 or 3 DCs
  const colClass = datacenters.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';

  // Precompute display colors per DC id
  const displayColors: Record<string, string> = {};
  datacenters.forEach(dc => {
    displayColors[dc.id] = getDisplayColor(getProviderColor(dc.provider));
  });

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-labelledby="comparison-modal-title"
          className="fixed inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-[#0a0a0a] border border-white/[0.10] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-2 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95 duration-200 outline-none focus:outline-none"
        >

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#BF5AF2]/15 border border-[#BF5AF2]/20 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-[#BF5AF2]" />
              </div>
              <div>
                <h2 id="comparison-modal-title" className="text-base font-bold text-white">Compare Datacenters</h2>
                <p className="text-xs text-white/35">Side-by-side comparison of selected datacenters</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/35 hover:text-white hover:bg-white/[0.08] transition-all"
              aria-label="Close comparison"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto scrollbar-hide flex-1 p-5">

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/[0.04] rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Datacenters</p>
                <p className="text-xl font-bold text-white tabular-nums">{datacenters.length}</p>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Best PUE</p>
                <p className="text-xl font-bold text-[#00D084] tabular-nums">
                  {bestPue != null ? bestPue.toFixed(2) : 'N/A'}
                </p>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Renewable</p>
                <p className="text-xl font-bold text-white tabular-nums">
                  {renewableCount}/{datacenters.length}
                </p>
              </div>
            </div>

            {/* Selected DCs */}
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Selected</p>
              <div className={`grid grid-cols-1 gap-2 ${colClass}`}>
                {datacenters.map(dc => (
                  <div key={dc.id} className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl p-3">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: displayColors[dc.id], boxShadow: `0 0 6px ${displayColors[dc.id]}60` }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{dc.name}</p>
                      <p className="text-xs text-white/40">{dc.provider} · {dc.city}, {dc.state}</p>
                    </div>
                    <button
                      onClick={() => onRemove(dc.id)}
                      className="w-6 h-6 flex items-center justify-center text-white/25 hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-lg transition-all flex-shrink-0"
                      aria-label={`Remove ${dc.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison fields */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Comparison</p>
              <div className="space-y-2">
                {fields.map(field => (
                  <div key={field.key} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">{field.label}</p>
                    <div className={`grid grid-cols-1 gap-3 ${colClass}`}>
                      {datacenters.map(dc => {
                        const val = getValue(dc, field.key);
                        return (
                          <div key={dc.id} className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: displayColors[dc.id] }}
                              />
                              <span className="text-[10px] text-white/35 truncate">{dc.name}</span>
                            </div>
                            <span className={getValueClass(field.key, val)}>{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3 flex-shrink-0">
            <p className="text-xs text-white/25">Up to 3 datacenters</p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/[0.08] text-sm text-white/50 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              Close
            </button>
          </div>

        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
});
