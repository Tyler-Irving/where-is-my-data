'use client';

import { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/mapbox';
import { useNetworkStore } from '@/store/networkStore';
import { useDatacenterStore } from '@/store/datacenterStore';
import {
  getAllConnections,
  getConnectionColor
} from '@/lib/utils/network';
import type { FeatureCollection, LineString } from 'geojson';

export function NetworkBackboneLines() {
  const {
    showBackbone,
    selectedProviders,
    selectedConnectionTypes,
    opacity,
    lineWidth,
    animate,
  } = useNetworkStore();
  
  const datacenters = useDatacenterStore((state) => state.datacenters);
  
  const geojson = useMemo(() => {
    if (!showBackbone) return null;
    
    // Get connections based on filters
    let connections = getAllConnections();
    
    // Filter by provider if any selected
    if (selectedProviders.length > 0) {
      connections = connections.filter(conn => 
        selectedProviders.includes(conn.provider)
      );
    }
    
    // Filter by connection type
    if (selectedConnectionTypes.length > 0) {
      connections = connections.filter(conn =>
        selectedConnectionTypes.includes(conn.connectionType)
      );
    }
    
    // Only show active connections
    connections = connections.filter(conn => conn.active);
    
    // Build GeoJSON
    const features = connections.map((conn) => {
      const fromDc = datacenters.find(dc => dc.id === conn.fromDatacenterId);
      const toDc = datacenters.find(dc => dc.id === conn.toDatacenterId);
      
      if (!fromDc || !toDc) return null;
      
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: [
            [fromDc.lng, fromDc.lat],
            [toDc.lng, toDc.lat],
          ],
        },
        properties: {
          id: conn.id,
          provider: conn.provider,
          connectionType: conn.connectionType,
          speed: conn.speed || '',
          redundant: conn.redundant,
          color: getConnectionColor(conn.connectionType),
          fromName: fromDc.metadata?.displayName || fromDc.name,
          toName: toDc.metadata?.displayName || toDc.name,
          notes: conn.notes || '',
        },
      };
    }).filter((f): f is NonNullable<typeof f> => f !== null);

    const result: FeatureCollection<LineString> = {
      type: 'FeatureCollection',
      features,
    };
    
    return result;
  }, [
    showBackbone,
    selectedProviders,
    selectedConnectionTypes,
    datacenters,
  ]);
  
  if (!showBackbone || !geojson || geojson.features.length === 0) {
    return null;
  }
  
  return (
    <Source id="network-backbone" type="geojson" data={geojson}>
      {/* Outer glow */}
      <Layer
        id="network-backbone-glow"
        type="line"
        paint={{
          'line-color': ['get', 'color'],
          'line-width': lineWidth * 3,
          'line-opacity': opacity * 0.2,
          'line-blur': 6,
        }}
      />
      
      {/* Main line */}
      <Layer
        id="network-backbone-main"
        type="line"
        paint={{
          'line-color': ['get', 'color'],
          'line-width': lineWidth,
          'line-opacity': opacity,
        }}
      />
      
      {/* Dashed overlay for redundant connections */}
      <Layer
        id="network-backbone-redundant"
        type="line"
        filter={['==', ['get', 'redundant'], true]}
        paint={{
          'line-color': '#ffffff',
          'line-width': Math.max(1, lineWidth - 1),
          'line-opacity': opacity * 0.5,
          'line-dasharray': [3, 3],
        }}
      />
      
      {/* Animated pulse for active connections (optional) */}
      {animate && (
        <Layer
          id="network-backbone-pulse"
          type="line"
          paint={{
            'line-color': ['get', 'color'],
            'line-width': lineWidth * 1.5,
            'line-opacity': ['interpolate', ['linear'], ['zoom'],
              3, 0.1,
              6, 0.3,
              12, 0.5
            ],
            'line-blur': 3,
          }}
        />
      )}
    </Source>
  );
}
