'use client';

import React, { useMemo } from 'react';
import { useMapStore, COUNTRY_CONFIGS } from '@/store/mapStore';
import { useDatacenterStore } from '@/store/datacenterStore';

export const CountrySwitcher = React.memo(function CountrySwitcher() {
  const { activeCountry, setActiveCountry } = useMapStore();
  const { datacenters } = useDatacenterStore();

  // Only show countries that have datacenter data
  const availableCountries = useMemo(() => {
    const seen = new Set<string>();
    datacenters.forEach((dc) => seen.add(dc.country ?? 'US'));
    return Object.keys(COUNTRY_CONFIGS).filter((code) => seen.has(code));
  }, [datacenters]);

  if (availableCountries.length <= 1) return null;

  const handleSwitch = (code: string) => {
    if (code === activeCountry) return;
    setActiveCountry(code); // filter applied after animation lands (MapContainer moveend)
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-1.5 py-1.5">
      {availableCountries.map((code) => {
        const config = COUNTRY_CONFIGS[code];
        const isActive = code === activeCountry;
        return (
          <button
            key={code}
            onClick={() => handleSwitch(code)}
            aria-pressed={isActive}
            aria-label={`Switch to ${config.label}`}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-200',
              isActive
                ? 'bg-[#0066FF] text-white shadow-[0_0_12px_rgba(0,102,255,0.4)]'
                : 'text-white/50 hover:text-white hover:bg-white/10',
            ].join(' ')}
          >
            <span>{config.flag}</span>
            <span>{code}</span>
          </button>
        );
      })}
    </div>
  );
});
