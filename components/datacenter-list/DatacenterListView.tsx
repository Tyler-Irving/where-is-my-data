'use client';

import React, { useMemo } from 'react';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useFilterStore } from '@/store/filterStore';
import { filterDatacenters } from '@/lib/utils/filterDatacenters';
import { DatacenterCard } from './DatacenterCard';

export function DatacenterListView() {
  const { datacenters } = useDatacenterStore();
  const { providers, providerTypes, countries, capacityRange, pueRange, renewableOnly } = useFilterStore();

  const filtered = useMemo(
    () => filterDatacenters(datacenters, { providers, providerTypes, countries, capacityRange, pueRange, renewableOnly }),
    [datacenters, providers, providerTypes, countries, capacityRange, pueRange, renewableOnly]
  );

  return (
    <div className="min-h-[calc(100vh-9.5rem)] md:h-full overflow-y-auto scrollbar-hide bg-black">
      {/* Sticky count bar */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-white/[0.04] px-4 md:px-6 py-2.5 flex items-center gap-2">
        <span className="text-[#0066FF] font-black text-sm tabular-nums">{filtered.length}</span>
        <span className="text-xs text-white/40">datacenters</span>
        {filtered.length < datacenters.length && (
          <span className="text-xs text-white/25">of {datacenters.length} total</span>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
          {filtered.map(dc => (
            <DatacenterCard key={dc.id} datacenter={dc} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm text-white/35">No datacenters match current filters</p>
          <p className="text-xs text-white/20 mt-1">Try adjusting the filters above</p>
        </div>
      )}
    </div>
  );
}
