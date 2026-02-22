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
  const { providers, providerTypes, capacityRange, pueRange, renewableOnly } = useFilterStore();
  const [hoveredDatacenter, setHoveredDatacenter] = useState<Datacenter | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any pending hide timeout
  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Show tooltip immediately
  const handleMarkerEnter = useCallback((datacenter: Datacenter) => {
    clearHideTimeout();
    setHoveredDatacenter(datacenter);
    onHoverChange?.(datacenter);
  }, [clearHideTimeout, onHoverChange]);

  // Delay hiding tooltip to allow mouse to move to tooltip
  const handleMarkerLeave = useCallback(() => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredDatacenter(null);
      onHoverChange?.(null);
    }, 200); // 200ms delay
  }, [clearHideTimeout, onHoverChange]);

  // Keep tooltip visible when mouse enters it
  const handleTooltipEnter = useCallback(() => {
    clearHideTimeout();
  }, [clearHideTimeout]);

  // Hide tooltip when mouse leaves it
  const handleTooltipLeave = useCallback(() => {
    handleMarkerLeave();
  }, [handleMarkerLeave]);

  // Scale marker size based on zoom level (memoized)
  const markerSize = useMemo(() => {
    const zoom = viewport.zoom;
    if (zoom < 5) return 'w-2 h-2';
    if (zoom < 7) return 'w-3 h-3';
    return 'w-4 h-4';
  }, [viewport.zoom]);
  
  // Filter datacenters based on active filters
  const filteredDatacenters = useMemo(() => {
    return filterDatacenters(datacenters, { providers, providerTypes, capacityRange, pueRange, renewableOnly });
  }, [datacenters, providers, providerTypes, capacityRange, pueRange, renewableOnly]);
  
  // Calculate offsets for overlapping datacenters
  const datacentersWithOffsets = useMemo(() => {
    return calculateMarkerOffsets(filteredDatacenters);
  }, [filteredDatacenters]);

  // Precompute colocation counts (O(n) instead of O(n²))
  const colocatedCounts = useMemo(() => {
    return buildColocatedCountMap(datacenters);
  }, [datacenters]);

  return (
    <>
      {datacentersWithOffsets.map((datacenter) => {
        const colocatedCount = getColocatedCount(colocatedCounts, datacenter.lat, datacenter.lng);
        const hasMultiple = colocatedCount > 1;
        const providerColor = getProviderColor(datacenter.provider);
        const displayColor = getDisplayColor(providerColor);
        
        return (
          <Marker
            key={datacenter.id}
            latitude={datacenter.offsetLat}
            longitude={datacenter.offsetLng}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              selectDatacenter(datacenter.id);
            }}
          >
            <div className="relative">
              <div 
                className={`${markerSize} rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-150 ${
                  selectedDatacenter === datacenter.id ? 'scale-150' : ''
                }`}
                style={{
                  backgroundColor: selectedDatacenter === datacenter.id 
                    ? '#3b82f6' // blue-500
                    : displayColor,
                  boxShadow: selectedDatacenter === datacenter.id 
                    ? '0 0 0 2px #3b82f6'
                    : `0 0 6px ${displayColor}`
                }}
                onMouseEnter={() => handleMarkerEnter(datacenter)}
                onMouseLeave={handleMarkerLeave}
              />
              {/* Show count badge for co-located datacenters */}
              {hasMultiple && viewport.zoom >= 6 && (
                <div 
                  className="absolute -top-1 -right-1 bg-gray-900 border border-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold text-white shadow-lg pointer-events-none"
                  style={{ zIndex: 10 }}
                >
                  {colocatedCount}
                </div>
              )}
            </div>
          </Marker>
        );
      })}

      {/* Show tooltip for hovered datacenter */}
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
