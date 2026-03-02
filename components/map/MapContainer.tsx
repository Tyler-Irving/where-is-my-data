'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Map, { Source, Layer, type MapRef } from 'react-map-gl/mapbox';
import { useMapStore, COUNTRY_CONFIGS, _setMapInstance } from '@/store/mapStore';
import { CountrySwitcher } from './CountrySwitcher';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useFilterStore } from '@/store/filterStore';
import { mockDatacenters } from '@/lib/data/mockDatacenters';
import { DatacenterMarkers } from './DatacenterMarkers';
import { MapControls } from './MapControls';
import { LatencyLines } from '@/components/latency/LatencyLines';
import { Datacenter } from '@/types/datacenter';
import { getProviderColor } from '@/lib/utils/providerColors';
import { getDisplayColor } from '@/lib/utils/colorBrightness';
import { filterDatacenters } from '@/lib/utils/filterDatacenters';
import { usePricingStore } from '@/store/pricingStore';
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
  const { viewport, setViewport, activeCountry } = useMapStore();
  const countryConfig = COUNTRY_CONFIGS[activeCountry] ?? COUNTRY_CONFIGS['US'];
  const mapRef = useRef<MapRef>(null);
  const { datacenters, setDatacenters } = useDatacenterStore();
  const { providers, providerTypes, countries, capacityRange, pueRange, renewableOnly, setCountry, clearCountry } = useFilterStore();
  const setPricingData = usePricingStore((s) => s.setPricingData);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hoveredDatacenter, setHoveredDatacenter] = useState<Datacenter | null>(null);

  const filterCriteria = useMemo(() => ({
    providers, providerTypes, countries, capacityRange, pueRange, renewableOnly,
  }), [providers, providerTypes, countries, capacityRange, pueRange, renewableOnly]);

  // H-7: Compute filteredDatacenters once here and pass it down to
  // DatacenterMarkers so filterDatacenters() is not called independently in
  // multiple components on the same render cycle.
  const filteredDatacenters = useMemo(
    () => filterDatacenters(datacenters, filterCriteria),
    [datacenters, filterCriteria]
  );

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

  useEffect(() => {
    async function fetchPricing() {
      try {
        const res = await fetch('/api/pricing');
        if (!res.ok) return;
        const data = await res.json();
        setPricingData(data.datacenters);
      } catch {
        // silent fail — pricing badges render null until data is available
      }
    }
    fetchPricing();
  }, [setPricingData]);

  // H-7: Uses the already-memoized filteredDatacenters instead of calling
  // filterDatacenters() again. This is the second of the two callsites
  // eliminated — DatacenterMarkers now receives filteredDatacenters as a prop.
  const connectionLines = useMemo(() => {
    if (!hoveredDatacenter || filteredDatacenters.length === 0) {
      return { type: 'FeatureCollection' as const, features: [] };
    }
    const sameProviderDatacenters = filteredDatacenters.filter(
      dc => dc.provider === hoveredDatacenter.provider && dc.id !== hoveredDatacenter.id
    );
    const features = sameProviderDatacenters.map(dc => ({
      type: 'Feature' as const,
      geometry: { type: 'LineString' as const, coordinates: [[hoveredDatacenter.lng, hoveredDatacenter.lat], [dc.lng, dc.lat]] },
      properties: { provider: hoveredDatacenter.provider }
    }));
    return { type: 'FeatureCollection' as const, features };
  }, [hoveredDatacenter, filteredDatacenters]);

  // Always-current ref so handleLoad (created once) reads fresh config values.
  const countryConfigRef = useRef(countryConfig);
  countryConfigRef.current = countryConfig;

  // Monotonic counter: each country-switch animation gets a unique ID so stale
  // moveend callbacks from interrupted animations are silently discarded.
  const animationGenRef = useRef(0);

  // Fires once when Mapbox finishes loading. Sets projection/bounds imperatively.
  // Must NOT be reactive (no countryConfig dep) — re-creating it would not re-run
  // onLoad, and it uses countryConfigRef to stay fresh.
  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    _setMapInstance(map);
    map.setProjection('mercator');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.setMaxBounds((countryConfigRef.current.maxBounds ?? null) as any);
    map.setMinZoom(countryConfigRef.current.minZoom);
  }, []); // intentionally empty — handleLoad only runs once via onLoad; countryConfigRef is a ref

  // When the active country changes, drive navigation imperatively:
  // 1. Clear old bounds so the camera can move freely.
  // 2. flyTo the new country with a smooth easeInOut curve.
  // 3. Once the animation finishes, lock bounds + apply the country filter.
  //
  // Delaying setCountry until moveend keeps current-country markers visible
  // during the flight, eliminating the "markers snap before camera moves" choppiness.
  // The animationGenRef guards against stale moveend callbacks on rapid clicks.
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !map.loaded()) return;

    const cfg = countryConfigRef.current;
    const targetCountry = activeCountry;
    const myGen = ++animationGenRef.current;

    // null is valid at runtime but not in mapbox-gl's TypeScript types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.setMaxBounds(null as any);
    map.setMinZoom(0);

    map.flyTo({
      center: [cfg.viewport.longitude, cfg.viewport.latitude],
      zoom: cfg.viewport.zoom,
      bearing: 0,
      pitch: 0,
      duration: 1200,
      easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    });

    map.once('moveend', () => {
      if (animationGenRef.current !== myGen) return; // superseded by a newer animation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.setMaxBounds((cfg.maxBounds ?? null) as any);
      map.setMinZoom(cfg.minZoom);
      // GLOBAL view shows all countries; individual country codes filter to that country
      if (targetCountry === 'GLOBAL') {
        clearCountry();
      } else {
        setCountry(targetCountry);
      }
    });
  }, [activeCountry, setCountry, clearCountry]); // intentionally omit countryConfigRef — it's a ref, always current

  const handleMove = useCallback(
    (evt: { viewState: Parameters<typeof setViewport>[0] }) => setViewport(evt.viewState),
    [setViewport]
  );

  // H-10: Only the provider name is used to derive the layer color, so depend
  // on hoveredDatacenter?.provider (a string) rather than the full object.
  // This avoids recomputing the layer style when unrelated fields change.
  const hoveredProvider = hoveredDatacenter?.provider ?? null;
  const connectionLineLayer = useMemo(() => {
    const providerColor = hoveredProvider ? getProviderColor(hoveredProvider) : '#6B7280';
    const displayColor = getDisplayColor(providerColor);
    return {
      id: 'connection-lines',
      type: 'line' as const,
      paint: { 'line-color': displayColor, 'line-width': 1.5, 'line-opacity': 0.5, 'line-dasharray': [3, 3] }
    };
  }, [hoveredProvider]);

  return (
    <div className="relative w-full h-[calc(100vh-9.5rem)] md:h-full">
      {isLoading && <LoadingDots />}
      <CountrySwitcher />

      <Map
        ref={mapRef}
        initialViewState={viewport}
        onMove={handleMove}
        onLoad={handleLoad}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        maxZoom={12}
      >
        {connectionLines.features.length > 0 && (
          <Source id="connection-lines" type="geojson" data={connectionLines}>
            <Layer {...connectionLineLayer} />
          </Source>
        )}
        <LatencyLines />
        <DatacenterMarkers onHoverChange={setHoveredDatacenter} filteredDatacenters={filteredDatacenters} />
      </Map>

      <MapControls />
    </div>
  );
});
