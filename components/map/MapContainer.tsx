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

// Mapbox access token - get yours at https://account.mapbox.com/access-tokens/
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  console.warn('NEXT_PUBLIC_MAPBOX_TOKEN is not set. Map will not render. See .env.example for setup instructions.');
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

  // Initialize data on mount
  useEffect(() => {
    async function fetchDatacenters() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/datacenters');
        if (!response.ok) {
          throw new Error('Failed to fetch datacenters');
        }
        const data = await response.json();
        setDatacenters(data.datacenters);
      } catch (error) {
        console.error('Error loading datacenters:', error);
        // Fallback to mock data
        setDatacenters(mockDatacenters);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDatacenters();
  }, [setDatacenters]);

  // Generate connection lines when hovering over a datacenter
  const connectionLines = useMemo(() => {
    if (!hoveredDatacenter || datacenters.length === 0) {
      return {
        type: 'FeatureCollection' as const,
        features: []
      };
    }

    const filtered = filterDatacenters(datacenters, filterCriteria);

    // Find all filtered datacenters from the same provider
    const sameProviderDatacenters = filtered.filter(
      dc => dc.provider === hoveredDatacenter.provider && dc.id !== hoveredDatacenter.id
    );

    // Create line features connecting hovered datacenter to each matching one
    const features = sameProviderDatacenters.map(dc => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [hoveredDatacenter.lng, hoveredDatacenter.lat],
          [dc.lng, dc.lat]
        ]
      },
      properties: {
        provider: hoveredDatacenter.provider
      }
    }));

    return {
      type: 'FeatureCollection' as const,
      features
    };
  }, [hoveredDatacenter, datacenters, filterCriteria]);

  // Line layer style
  const connectionLineLayer = useMemo(() => {
    const providerColor = hoveredDatacenter ? getProviderColor(hoveredDatacenter.provider) : '#6B7280';
    const displayColor = getDisplayColor(providerColor);
    
    return {
      id: 'connection-lines',
      type: 'line' as const,
      paint: {
        'line-color': displayColor,
        'line-width': 2,
        'line-opacity': 0.6,
        'line-dasharray': [2, 2] // Dashed line for subtle effect
      }
    };
  }, [hoveredDatacenter]);

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 14rem)' }}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-950/80 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg font-semibold">Loading datacenter data...</p>
            <p className="text-gray-400 text-sm mt-2">Preparing map view</p>
          </div>
        </div>
      )}

      <Map
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        maxBounds={[
          [-125, 24], // Southwest: California/Texas coast, Florida Keys
          [-66, 49]   // Northeast: Maine, US-Canada border
        ]}
        minZoom={3}
        maxZoom={12}
      >
        {/* Connection lines (rendered below markers) */}
        {connectionLines.features.length > 0 && (
          <Source id="connection-lines" type="geojson" data={connectionLines}>
            <Layer {...connectionLineLayer} />
          </Source>
        )}

        {/* Network backbone visualization */}
        <NetworkBackboneLines />

        {/* Latency lines */}
        <LatencyLines />

        {/* Datacenter markers */}
        <DatacenterMarkers onHoverChange={setHoveredDatacenter} />
      </Map>

      {/* Map controls */}
      <MapControls />
      
      {/* Map legend */}
      <MapLegend />
    </div>
  );
});
