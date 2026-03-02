'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Marker } from 'react-map-gl/mapbox';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useMapStore } from '@/store/mapStore';
import { DatacenterTooltip } from './DatacenterTooltip';
import { Datacenter } from '@/types/datacenter';
import { getProviderColor } from '@/lib/utils/providerColors';
import { getDisplayColor } from '@/lib/utils/colorBrightness';
import { calculateMarkerOffsets, buildColocatedCountMap, getColocatedCount } from '@/lib/utils/markerOffset';

// L-1: Named constants for marker sizes and zoom thresholds
const MARKER_SIZE_SMALL = 8;
const MARKER_SIZE_MEDIUM = 11;
const MARKER_SIZE_LARGE = 14;
const ZOOM_THRESHOLD_SMALL = 5;
const ZOOM_THRESHOLD_MEDIUM = 7;
const ZOOM_COLOCATED_BADGE = 6;

// H-7: filteredDatacenters is computed once in MapContainer and passed as a prop.
interface DatacenterMarkersProps {
  onHoverChange?: (datacenter: Datacenter | null) => void;
  filteredDatacenters: Datacenter[];
}

// M-6: Extract MarkerDot as a memoized sub-component so per-marker handlers
// are stable (bound once via useCallback) and each dot only re-renders when
// its own props change rather than on every parent render.
interface MarkerDotProps {
  datacenter: Datacenter & { offsetLat: number; offsetLng: number };
  markerSize: number;
  isSelected: boolean;
  displayColor: string;
  showBadge: boolean;
  colocatedCount: number;
  onEnter: (datacenter: Datacenter) => void;
  onLeave: () => void;
  onSelect: (id: string) => void;
}

const MarkerDot = React.memo(function MarkerDot({
  datacenter,
  markerSize,
  isSelected,
  displayColor,
  showBadge,
  colocatedCount,
  onEnter,
  onLeave,
  onSelect,
}: MarkerDotProps) {
  // These callbacks depend only on stable parent callbacks + stable datacenter
  // identity, so they are created once per marker instance.
  const handleEnter = useCallback(() => onEnter(datacenter), [onEnter, datacenter]);

  const handleMarkerClick = useCallback(
    (e: { originalEvent: { stopPropagation: () => void } }) => {
      e.originalEvent.stopPropagation();
      onSelect(datacenter.id);
    },
    [onSelect, datacenter.id]
  );

  // C-1: keyboard handler — Enter/Space activates the marker like a button
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(datacenter.id);
      }
    },
    [onSelect, datacenter.id]
  );

  return (
    <Marker
      latitude={datacenter.offsetLat}
      longitude={datacenter.offsetLng}
      anchor="bottom"
      onClick={handleMarkerClick}
    >
      <div className="relative">
        {/* C-1: role, tabIndex, aria-label, and onKeyDown for keyboard accessibility */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`${datacenter.name} datacenter (${datacenter.provider})`}
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
          onMouseEnter={handleEnter}
          onMouseLeave={onLeave}
          onKeyDown={handleKeyDown}
        />
        {showBadge && (
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
});

export const DatacenterMarkers = React.memo(function DatacenterMarkers({
  onHoverChange,
  filteredDatacenters,
}: DatacenterMarkersProps) {
  const { datacenters } = useDatacenterStore();

  // C-5: Subscribe to individual map store fields with selectors instead of
  // destructuring the whole store. The viewport object updates every frame
  // during pan/zoom, so we only read the zoom value to avoid per-frame
  // re-renders of the entire marker list.
  const selectDatacenter = useMapStore((state) => state.selectDatacenter);
  const selectedDatacenter = useMapStore((state) => state.selectedDatacenter);
  const zoom = useMapStore((state) => state.viewport.zoom);

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

  // L-1: Use named constants instead of magic number literals
  const markerSize = useMemo(() => {
    if (zoom < ZOOM_THRESHOLD_SMALL) return MARKER_SIZE_SMALL;
    if (zoom < ZOOM_THRESHOLD_MEDIUM) return MARKER_SIZE_MEDIUM;
    return MARKER_SIZE_LARGE;
  }, [zoom]);

  // H-7: filteredDatacenters arrives as a prop — no filterDatacenters() call here.
  const datacentersWithOffsets = useMemo(() => calculateMarkerOffsets(filteredDatacenters), [filteredDatacenters]);
  const colocatedCounts = useMemo(() => buildColocatedCountMap(datacenters), [datacenters]);

  return (
    <>
      {datacentersWithOffsets.map((datacenter) => {
        const colocatedCount = getColocatedCount(colocatedCounts, datacenter.lat, datacenter.lng);
        const hasMultiple = colocatedCount > 1;
        const displayColor = getDisplayColor(getProviderColor(datacenter.provider));
        const isSelected = selectedDatacenter === datacenter.id;
        // L-1: Named constant for badge threshold
        const showBadge = hasMultiple && zoom >= ZOOM_COLOCATED_BADGE;

        return (
          <MarkerDot
            key={datacenter.id}
            datacenter={datacenter}
            markerSize={markerSize}
            isSelected={isSelected}
            displayColor={displayColor}
            showBadge={showBadge}
            colocatedCount={colocatedCount}
            onEnter={handleMarkerEnter}
            onLeave={handleMarkerLeave}
            onSelect={selectDatacenter}
          />
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
