'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Map, { Source, Layer } from 'react-map-gl/mapbox';
import type { LineLayer } from 'react-map-gl/mapbox';
import { useMapStore } from '@/store/mapStore';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useFilterStore } from '@/store/filterStore';
import { mockDatacenters } from '@/lib/data/mockDatacenters';
import { DatacenterMarkers } from './DatacenterMarkers';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { Datacenter } from '@/types/datacenter';
import { getProviderColor } from '@/lib/utils/providerColors';
import { getDisplayColor } from '@/lib/utils/colorBrightness';
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
  const [dataSource, setDataSource] = React.useState<string>('Loading...');
  const [hoveredDatacenter, setHoveredDatacenter] = useState<Datacenter | null>(null);
  
  // Count filtered datacenters
  const filteredCount = useMemo(() => {
    return datacenters.filter((dc) => {
      if (providers.size > 0 && !providers.has(dc.provider)) return false;
      if (providerTypes.size > 0) {
        const dcType = dc.metadata?.providerType;
        if (!dcType || !providerTypes.has(dcType)) return false;
      }
      const capacity = dc.metadata?.capacityMW;
      if (capacity !== undefined && (capacity < capacityRange[0] || capacity > capacityRange[1])) {
        return false;
      } else if (capacity === undefined && (capacityRange[0] !== 0 || capacityRange[1] !== 500)) {
        return false;
      }
      const pue = dc.metadata?.pue;
      if (pue !== undefined && (pue < pueRange[0] || pue > pueRange[1])) {
        return false;
      } else if (pue === undefined && (pueRange[0] !== 1.0 || pueRange[1] !== 2.0)) {
        return false;
      }
      if (renewableOnly && !dc.metadata?.renewable) return false;
      return true;
    }).length;
  }, [datacenters, providers, providerTypes, capacityRange, pueRange, renewableOnly]);

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
        setDataSource(`${data.source} (${data.count} facilities)`);
      } catch (error) {
        console.error('Error loading datacenters:', error);
        // Fallback to mock data
        setDatacenters(mockDatacenters);
        setDataSource(`Mock Data (${mockDatacenters.length} facilities)`);
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

    // Filter datacenters first
    const filtered = datacenters.filter((dc) => {
      if (providers.size > 0 && !providers.has(dc.provider)) return false;
      if (providerTypes.size > 0) {
        const dcType = dc.metadata?.providerType;
        if (!dcType || !providerTypes.has(dcType)) return false;
      }
      const capacity = dc.metadata?.capacityMW;
      if (capacity !== undefined && (capacity < capacityRange[0] || capacity > capacityRange[1])) {
        return false;
      } else if (capacity === undefined && (capacityRange[0] !== 0 || capacityRange[1] !== 500)) {
        return false;
      }
      const pue = dc.metadata?.pue;
      if (pue !== undefined && (pue < pueRange[0] || pue > pueRange[1])) {
        return false;
      } else if (pue === undefined && (pueRange[0] !== 1.0 || pueRange[1] !== 2.0)) {
        return false;
      }
      if (renewableOnly && !dc.metadata?.renewable) return false;
      return true;
    });

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
  }, [hoveredDatacenter, datacenters, providers, providerTypes, capacityRange, pueRange, renewableOnly]);

  // Line layer style
  const connectionLineLayer: LineLayer = useMemo(() => {
    const providerColor = hoveredDatacenter ? getProviderColor(hoveredDatacenter.provider) : '#6B7280';
    const displayColor = getDisplayColor(providerColor);
    
    return {
      id: 'connection-lines',
      type: 'line',
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
            <p className="text-gray-400 text-sm mt-2">Fetching from PeeringDB</p>
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
