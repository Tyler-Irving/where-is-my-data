'use client';

import React from 'react';
import { X, BarChart3 } from 'lucide-react';
import { Datacenter } from '@/types/datacenter';
import { getProviderColor } from '@/lib/utils/providerColors';
import { getDisplayColor } from '@/lib/utils/colorBrightness';

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
    { label: 'Renewable', key: 'renewable' },
    { label: 'Opened', key: 'opened' },
    { label: 'Availability Zones', key: 'azs' },
    { label: 'Region', key: 'region' },
  ];

  const getValue = (dc: Datacenter, key: string) => {
    switch (key) {
      case 'provider': return dc.provider;
      case 'location': return `${dc.city}, ${dc.state}`;
      case 'capacity': return dc.metadata?.capacityMW ? `${dc.metadata.capacityMW} MW` : 'N/A';
      case 'pue': return dc.metadata?.pue ? dc.metadata.pue.toFixed(2) : 'N/A';
      case 'renewable': return dc.metadata?.renewable ? '✓ Yes' : '✗ No';
      case 'opened': return dc.metadata?.opened?.toString() || 'N/A';
      case 'azs': return dc.metadata?.availabilityZones?.toString() || 'N/A';
      case 'region': return dc.metadata?.region?.replace(/-/g, ' ') || 'N/A';
      default: return 'N/A';
    }
  };

  const isGood = (key: string, val: string) => {
    if (key === 'renewable') return val === '✓ Yes';
    return false;
  };

  const isBad = (key: string, val: string) => {
    if (key === 'renewable') return val === '✗ No';
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative w-full sm:max-w-5xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-[#0a0a0a] border border-white/[0.10] rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-up duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#BF5AF2]/15 border border-[#BF5AF2]/20 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-[#BF5AF2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Compare Datacenters</h2>
              <p className="text-xs text-white/35">{datacenters.length} selected</p>
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

        {/* Table */}
        <div className="overflow-auto flex-1 p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-[#0a0a0a] border-b border-white/[0.06] px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white/35 min-w-[120px]">
                    Field
                  </th>
                  {datacenters.map((dc) => {
                    const color = getProviderColor(dc.provider);
                    const displayColor = getDisplayColor(color);
                    return (
                      <th key={dc.id} className="border-b border-white/[0.06] px-4 py-3 text-left min-w-[200px]">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: displayColor, boxShadow: `0 0 6px ${displayColor}60` }}
                            />
                            <span className="text-sm font-semibold text-white truncate">{dc.name}</span>
                          </div>
                          <button
                            onClick={() => onRemove(dc.id)}
                            className="text-white/25 hover:text-[#FF3B30] transition-colors flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[#FF3B30]/10"
                            aria-label={`Remove ${dc.name}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {fields.map((field, i) => (
                  <tr key={field.key} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                    <td className="sticky left-0 z-10 bg-[#0a0a0a] px-4 py-3 text-xs font-semibold text-white/50 border-b border-white/[0.04] uppercase tracking-wide whitespace-nowrap">
                      {field.label}
                    </td>
                    {datacenters.map((dc) => {
                      const val = getValue(dc, field.key);
                      return (
                        <td key={dc.id} className="px-4 py-3 text-sm border-b border-white/[0.04]">
                          <span className={
                            isGood(field.key, val) ? 'text-[#00D084] font-semibold' :
                            isBad(field.key, val) ? 'text-white/35' :
                            'text-white/70'
                          }>
                            {val}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
});
