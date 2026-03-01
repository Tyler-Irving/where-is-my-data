'use client';

import React, { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useFilterStore } from '@/store/filterStore';
import { filterDatacenters } from '@/lib/utils/filterDatacenters';

export const ExportButton = React.memo(function ExportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [exported, setExported] = useState(false);
  const { datacenters } = useDatacenterStore();
  const { providers, providerTypes, countries, capacityRange, pueRange, renewableOnly } = useFilterStore();

  const filteredDatacenters = React.useMemo(() => {
    return filterDatacenters(datacenters, { providers, providerTypes, countries, capacityRange, pueRange, renewableOnly });
  }, [datacenters, providers, providerTypes, countries, capacityRange, pueRange, renewableOnly]);

  const handleExport = (format: 'csv' | 'json') => {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      const headers = ['Name', 'Provider', 'City', 'State', 'Latitude', 'Longitude', 'Capacity (MW)', 'PUE', 'Renewable', 'Region', 'Opened', 'Availability Zones'];
      const rows = filteredDatacenters.map(dc => [
        dc.name, dc.provider, dc.city || '', dc.state,
        dc.lat.toFixed(4), dc.lng.toFixed(4),
        dc.metadata?.capacityMW?.toString() || '',
        dc.metadata?.pue?.toString() || '',
        dc.metadata?.renewable ? 'Yes' : 'No',
        dc.metadata?.region || '',
        dc.metadata?.opened?.toString() || '',
        dc.metadata?.availabilityZones?.toString() || '',
      ]);
      content = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      filename = `datacenters-${filteredDatacenters.length}-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(filteredDatacenters, null, 2);
      filename = `datacenters-${filteredDatacenters.length}-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => { setExported(false); setIsOpen(false); }, 2000);
  };

  const pillBase = 'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-200 border bg-white/[0.05] border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.10] whitespace-nowrap';

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className={pillBase} title="Export data">
        <Download className="w-3 h-3" />
        <span className="hidden sm:inline">Export</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 glass rounded-2xl z-50 min-w-[190px] shadow-2xl animate-in scale-in duration-200">
            <div className="p-2">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/25 border-b border-white/[0.06] mb-1">
                Export {filteredDatacenters.length} DCs
              </p>
              {exported ? (
                <div className="px-3 py-2 flex items-center gap-2 text-sm text-[#00D084]">
                  <Check className="w-4 h-4" /> Downloaded!
                </div>
              ) : (
                <>
                  {(['csv', 'json'] as const).map((fmt) => (
                    <button key={fmt} onClick={() => handleExport(fmt)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.05] transition-colors group">
                      <p className="text-sm font-semibold text-white/70 group-hover:text-white uppercase">{fmt}</p>
                      <p className="text-xs text-white/30">{fmt === 'csv' ? 'Spreadsheet' : 'Developer'} format</p>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
});
