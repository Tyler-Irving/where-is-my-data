'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Map, { Source, Layer } from 'react-map-gl/mapbox';
import { useMapStore } from '@/store/mapStore';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useFilterStore } from '@/store/filterStore';
import { mockDatacenters } from '@/lib/data/mockDatacenters';
import { DatacenterMarkers } from './DatacenterMarkers';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { LatencyLines } from '@/components/latency/LatencyLines';
import { NetworkBackboneLines } from '@/components/network/NetworkBackboneLines';
import { Datacenter } from '@/types/datacenter';
import { getProviderColor } from '@/lib/utils/providerColors';
import { getDisplayColor } from '@/lib/utils/colorBrightness';
import { filterDatacenters } from '@/lib/utils/filterDatacenters';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  console.warn('NEXT_PUBLIC_MAPBOX_TOKEN is not set. Map will not render. See .env.example for setup instructions.');
}

// Animated dot grid loading indicator
function LoadingDots() {
  return (
    <div className="absolute inset-0 bg-black/92 z-50 flex flex-col items-center justify-center gap-6">
      <div className="grid grid-cols-3 gap-2.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[#0066FF]"
            style={{
              animation: `pulse-dot 1.4s ease-in-out infinite`,
              animationDelay: `${(i * 0.15) % 0.9}s`,
              opacity: 0.2,
            }}
          />
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white">Loading datacenters</p>
        <p className="text-xs text-white/35 mt-1">Preparing map view</p>
      </div>
    </div>
  );
}

export const MapContainer = React.memo(function MapContainer() {
  const { viewport, setViewport } = useMapStore();
  const { datacenters, setDatacenters } = useDatacenterStore();
  const { providers, providerTypes, capacityRange, pueRange, renewableOnly } = useFilterStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [hoveredDatacenter, setHoveredDatacenter] = useState<Datacenter | null>(null);

  const filterCriteria = useMemo(() => ({
    providers, providerTypes, capacityRange, pueRange, renewableOnly,
  }), [providers, providerTypes, capacityRange, pueRange, renewableOnly]);

  useEffect(() => {
    async function fetchDatacenters() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/datacenters');
        if (!response.ok) throw new Error('Failed to fetch datacenters');
        const data = await response.json();
        setDatacenters(data.datacenters);
      } catch (error) {
        console.error('Error loading datacenters:', error);
        setDatacenters(mockDatacenters);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDatacenters();
  }, [setDatacenters]);

  const connectionLines = useMemo(() => {
    if (!hoveredDatacenter || datacenters.length === 0) {
      return { type: 'FeatureCollection' as const, features: [] };
    }
    const filtered = filterDatacenters(datacenters, filterCriteria);
    const sameProviderDatacenters = filtered.filter(
      dc => dc.provider === hoveredDatacenter.provider && dc.id !== hoveredDatacenter.id
    );
    const features = sameProviderDatacenters.map(dc => ({
      type: 'Feature' as const,
      geometry: { type: 'LineString' as const, coordinates: [[hoveredDatacenter.lng, hoveredDatacenter.lat], [dc.lng, dc.lat]] },
      properties: { provider: hoveredDatacenter.provider }
    }));
    return { type: 'FeatureCollection' as const, features };
  }, [hoveredDatacenter, datacenters, filterCriteria]);

  const connectionLineLayer = useMemo(() => {
    const providerColor = hoveredDatacenter ? getProviderColor(hoveredDatacenter.provider) : '#6B7280';
    const displayColor = getDisplayColor(providerColor);
    return {
      id: 'connection-lines',
      type: 'line' as const,
      paint: { 'line-color': displayColor, 'line-width': 1.5, 'line-opacity': 0.5, 'line-dasharray': [3, 3] }
    };
  }, [hoveredDatacenter]);

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 6.5rem)' }}>
      {isLoading && <LoadingDots />}

      <Map
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        maxBounds={[[-125, 24], [-66, 49]]}
        minZoom={3}
        maxZoom={12}
      >
        {connectionLines.features.length > 0 && (
          <Source id="connection-lines" type="geojson" data={connectionLines}>
            <Layer {...connectionLineLayer} />
          </Source>
        )}
        <NetworkBackboneLines />
        <LatencyLines />
        <DatacenterMarkers onHoverChange={setHoveredDatacenter} />
      </Map>

      <MapControls />
      <MapLegend />
    </div>
  );
});
