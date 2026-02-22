'use client';

import React, { useState } from 'react';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useFilterStore } from '@/store/filterStore';
import { filterDatacenters } from '@/lib/utils/filterDatacenters';

export const ExportButton = React.memo(function ExportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [exported, setExported] = useState(false);
  
  const { datacenters } = useDatacenterStore();
  const { providers, providerTypes, capacityRange, pueRange, renewableOnly } = useFilterStore();

  // Filter datacenters based on active filters
  const filteredDatacenters = React.useMemo(() => {
    return filterDatacenters(datacenters, { providers, providerTypes, capacityRange, pueRange, renewableOnly });
  }, [datacenters, providers, providerTypes, capacityRange, pueRange, renewableOnly]);

  const handleExport = (format: 'csv' | 'json') => {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      // CSV export
      const headers = ['Name', 'Provider', 'City', 'State', 'Latitude', 'Longitude', 'Capacity (MW)', 'PUE', 'Renewable', 'Region', 'Opened', 'Availability Zones'];
      const rows = filteredDatacenters.map(dc => [
        dc.name,
        dc.provider,
        dc.city || '',
        dc.state,
        dc.lat.toFixed(4),
        dc.lng.toFixed(4),
        dc.metadata?.capacityMW?.toString() || '',
        dc.metadata?.pue?.toString() || '',
        dc.metadata?.renewable ? 'Yes' : 'No',
        dc.metadata?.region || '',
        dc.metadata?.opened?.toString() || '',
        dc.metadata?.availabilityZones?.toString() || '',
      ]);
      
      content = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      filename = `datacenters-${filteredDatacenters.length}-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else {
      // JSON export
      content = JSON.stringify(filteredDatacenters, null, 2);
      filename = `datacenters-${filteredDatacenters.length}-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    }

    // Create download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show feedback
    setExported(true);
    setTimeout(() => {
      setExported(false);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all border bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 flex items-center gap-1.5 md:gap-2 whitespace-nowrap"
        title="Export datacenter data"
      >
        <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="hidden sm:inline">Export</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 min-w-[200px]">
            <div className="p-2">
              <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-800 mb-1">
                Export {filteredDatacenters.length} datacenter{filteredDatacenters.length !== 1 ? 's' : ''}
              </div>
              
              {exported ? (
                <div className="px-3 py-2 text-sm text-green-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Downloaded!
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <div className="text-sm text-gray-300 group-hover:text-white font-medium">CSV</div>
                        <div className="text-xs text-gray-500">Spreadsheet format</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <div>
                        <div className="text-sm text-gray-300 group-hover:text-white font-medium">JSON</div>
                        <div className="text-xs text-gray-500">Developer format</div>
                      </div>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
});
