'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Marker } from 'react-map-gl/mapbox';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useMapStore } from '@/store/mapStore';
import { useFilterStore } from '@/store/filterStore';
import { DatacenterTooltip } from './DatacenterTooltip';
import { Datacenter } from '@/types/datacenter';
import { getProviderColor } from '@/lib/utils/providerColors';
import { getDisplayColor } from '@/lib/utils/colorBrightness';
import { calculateMarkerOffsets, buildColocatedCountMap, getColocatedCount } from '@/lib/utils/markerOffset';
import { filterDatacenters } from '@/lib/utils/filterDatacenters';

interface DatacenterMarkersProps {
  onHoverChange?: (datacenter: Datacenter | null) => void;
}

export const DatacenterMarkers = React.memo(function DatacenterMarkers({ onHoverChange }: DatacenterMarkersProps) {
  const { datacenters } = useDatacenterStore();
  const { viewport, selectDatacenter, selectedDatacenter } = useMapStore();
  const { providers, providerTypes, countries, capacityRange, pueRange, renewableOnly } = useFilterStore();
  const [hoveredDatacenter, setHoveredDatacenter] = useState<Datacenter | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) { clearTimeout(hideTimeoutRef.current); hideTimeoutRef.current = null; }
  }, []);

  const handleMarkerEnter = useCallback((datacenter: Datacenter) => {
    clearHideTimeout();
    setHoveredDatacenter(datacenter);
    onHoverChange?.(datacenter);
  }, [clearHideTimeout, onHoverChange]);

  const handleMarkerLeave = useCallback(() => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredDatacenter(null);
      onHoverChange?.(null);
    }, 200);
  }, [clearHideTimeout, onHoverChange]);

  const handleTooltipEnter = useCallback(() => { clearHideTimeout(); }, [clearHideTimeout]);
  const handleTooltipLeave = useCallback(() => { handleMarkerLeave(); }, [handleMarkerLeave]);

  const markerSize = useMemo(() => {
    const zoom = viewport.zoom;
    if (zoom < 5) return 8;
    if (zoom < 7) return 11;
    return 14;
  }, [viewport.zoom]);

  const filteredDatacenters = useMemo(() => {
    return filterDatacenters(datacenters, { providers, providerTypes, countries, capacityRange, pueRange, renewableOnly });
  }, [datacenters, providers, providerTypes, countries, capacityRange, pueRange, renewableOnly]);

  const datacentersWithOffsets = useMemo(() => calculateMarkerOffsets(filteredDatacenters), [filteredDatacenters]);
  const colocatedCounts = useMemo(() => buildColocatedCountMap(datacenters), [datacenters]);

  return (
    <>
      {datacentersWithOffsets.map((datacenter) => {
        const colocatedCount = getColocatedCount(colocatedCounts, datacenter.lat, datacenter.lng);
        const hasMultiple = colocatedCount > 1;
        const displayColor = getDisplayColor(getProviderColor(datacenter.provider));
        const isSelected = selectedDatacenter === datacenter.id;

        return (
          <Marker
            key={datacenter.id}
            latitude={datacenter.offsetLat}
            longitude={datacenter.offsetLng}
            anchor="bottom"
            onClick={(e) => { e.originalEvent.stopPropagation(); selectDatacenter(datacenter.id); }}
          >
            <div className="relative">
              <div
                style={{
                  width: markerSize,
                  height: markerSize,
                  borderRadius: '50%',
                  border: `2px solid rgba(255,255,255,${isSelected ? 1 : 0.85})`,
                  backgroundColor: isSelected ? '#0066FF' : displayColor,
                  boxShadow: isSelected
                    ? `0 0 0 3px rgba(0,102,255,0.4), 0 2px 12px rgba(0,0,0,0.8)`
                    : `0 0 8px ${displayColor}60, 0 2px 8px rgba(0,0,0,0.7)`,
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(1.6)' : 'scale(1)',
                  transition: 'transform 150ms ease-out, box-shadow 150ms ease-out',
                }}
                onMouseEnter={() => handleMarkerEnter(datacenter)}
                onMouseLeave={handleMarkerLeave}
              />
              {hasMultiple && viewport.zoom >= 6 && (
                <div
                  className="absolute -top-1 -right-1 bg-black border border-white/40 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[7px] font-black text-white pointer-events-none"
                  style={{ zIndex: 10 }}
                >
                  {colocatedCount}
                </div>
              )}
            </div>
          </Marker>
        );
      })}

      {hoveredDatacenter && (
        <DatacenterTooltip
          datacenter={hoveredDatacenter}
          onClose={() => setHoveredDatacenter(null)}
          onMouseEnter={handleTooltipEnter}
          onMouseLeave={handleTooltipLeave}
        />
      )}
    </>
  );
});
