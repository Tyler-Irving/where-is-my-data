'use client';

import React from 'react';
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
  onRemove 
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <h2 className="text-xl font-semibold text-white">Compare Datacenters ({datacenters.length})</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close comparison"
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-auto flex-1 p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-gray-900 border-b border-gray-700 px-4 py-3 text-left text-sm font-semibold text-gray-400">
                    Field
                  </th>
                  {datacenters.map((dc) => {
                    const color = getProviderColor(dc.provider);
                    const displayColor = getDisplayColor(color);
                    return (
                      <th key={dc.id} className="border-b border-gray-700 px-4 py-3 text-left min-w-[200px]">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ 
                                backgroundColor: displayColor,
                                boxShadow: `0 0 4px ${displayColor}`
                              }}
                            />
                            <span className="text-white font-semibold text-sm truncate">{dc.name}</span>
                          </div>
                          <button
                            onClick={() => onRemove(dc.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                            aria-label={`Remove ${dc.name} from comparison`}
                            title="Remove from comparison"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {fields.map((field, i) => (
                  <tr key={field.key} className={i % 2 === 0 ? 'bg-gray-800/30' : ''}>
                    <td className="sticky left-0 z-10 bg-gray-900 px-4 py-3 text-sm font-medium text-gray-300 border-b border-gray-800">
                      {field.label}
                    </td>
                    {datacenters.map((dc) => (
                      <td key={dc.id} className="px-4 py-3 text-sm text-gray-400 border-b border-gray-800">
                        {getValue(dc, field.key)}
                      </td>
                    ))}
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
