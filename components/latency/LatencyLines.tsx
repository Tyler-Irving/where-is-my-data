'use client';

import { Layer, Source } from 'react-map-gl/mapbox';
import { useLatencyStore } from '@/store/latencyStore';
import type { FeatureCollection, LineString } from 'geojson';

export function LatencyLines() {
  const activeRoutes = useLatencyStore((state) => state.activeRoutes);
  
  if (activeRoutes.length === 0) return null;
  
  // Create GeoJSON from active routes
  const geojson: FeatureCollection<LineString> = {
    type: 'FeatureCollection',
    features: activeRoutes.map((route, idx) => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [route.from.lng, route.from.lat],
          [route.to.lng, route.to.lat],
        ],
      },
      properties: {
        id: idx,
        latency: route.latencyMs,
        color: route.color,
        fromName: route.from.name,
        toName: route.to.name,
      },
    })),
  };
  
  return (
    <>
      <Source id="latency-lines" type="geojson" data={geojson}>
        {/* Glow effect */}
        <Layer
          id="latency-lines-glow"
          type="line"
          paint={{
            'line-color': ['get', 'color'],
            'line-width': 4,
            'line-opacity': 0.3,
            'line-blur': 4,
          }}
        />
        
        {/* Main line */}
        <Layer
          id="latency-lines-main"
          type="line"
          paint={{
            'line-color': ['get', 'color'],
            'line-width': 2,
            'line-opacity': 0.8,
          }}
        />
        
        {/* Dashed overlay for animation effect */}
        <Layer
          id="latency-lines-dashed"
          type="line"
          paint={{
            'line-color': '#ffffff',
            'line-width': 1,
            'line-opacity': 0.4,
            'line-dasharray': [2, 3],
          }}
        />
      </Source>
    </>
  );
}
