// Zustand store for map state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Module-level map instance for imperative navigation from hooks/utilities
// that cannot access the React component's mapRef.
interface MinimalMapInstance {
  flyTo(opts: { center: [number, number]; zoom: number; bearing?: number; pitch?: number; duration?: number }): void;
}

let _mapInstance: MinimalMapInstance | null = null;

export function _setMapInstance(map: MinimalMapInstance | null) {
  _mapInstance = map;
}

export function flyToLocation(opts: { longitude: number; latitude: number; zoom: number; bearing?: number; pitch?: number }) {
  _mapInstance?.flyTo({
    center: [opts.longitude, opts.latitude],
    zoom: opts.zoom,
    bearing: opts.bearing ?? 0,
    pitch: opts.pitch ?? 0,
  });
}

export interface CountryConfig {
  label: string;
  flag: string;
  viewport: { latitude: number; longitude: number; zoom: number };
  maxBounds?: [[number, number], [number, number]];
  minZoom: number;
}

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  GLOBAL: {
    label: 'World',
    flag: '🌍',
    viewport: { latitude: 20, longitude: 0, zoom: 2 },
    minZoom: 1,
  },
  US: {
    label: 'United States',
    flag: '🇺🇸',
    viewport: { latitude: 38.5, longitude: -96.0, zoom: 3.5 },
    maxBounds: [[-135, 20], [-60, 54]],
    minZoom: 3,
  },
  DE: {
    label: 'Germany',
    flag: '🇩🇪',
    viewport: { latitude: 51.2, longitude: 10.5, zoom: 3.5 },
    maxBounds: [[1.0, 44.0], [22.0, 59.0]],
    minZoom: 3,
  },
  GB: {
    label: 'United Kingdom',
    flag: '🇬🇧',
    viewport: { latitude: 54.5, longitude: 0.5, zoom: 4.5 },
    maxBounds: [[-13.0, 48.5], [5.0, 63.0]],
    minZoom: 3,
  },
  NL: {
    label: 'Netherlands',
    flag: '🇳🇱',
    viewport: { latitude: 52.2, longitude: 5.3, zoom: 5.5 },
    maxBounds: [[0.5, 48.5], [11.0, 56.5]],
    minZoom: 4,
  },
  SG: {
    label: 'Singapore',
    flag: '🇸🇬',
    viewport: { latitude: 1.35, longitude: 103.82, zoom: 10.5 },
    maxBounds: [[103.5, 1.1], [104.1, 1.6]],
    minZoom: 9,
  },
};

export const DEFAULT_COUNTRY = 'GLOBAL';

export interface ViewportState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

interface MapState {
  // View state
  viewport: ViewportState;

  // UI state
  selectedDatacenter: string | null;
  activeCountry: string;

  // Actions
  setViewport: (viewport: Partial<ViewportState>) => void;
  selectDatacenter: (id: string | null) => void;
  setActiveCountry: (code: string) => void;
}

const initialViewport: ViewportState = {
  latitude: 20,
  longitude: 0,
  zoom: 2,
  bearing: 0,
  pitch: 0,
};

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      viewport: initialViewport,
      selectedDatacenter: null,
      activeCountry: DEFAULT_COUNTRY,

      setViewport: (viewport) =>
        set((state) => ({
          viewport: { ...state.viewport, ...viewport }
        })),

      selectDatacenter: (id) => set({ selectedDatacenter: id }),

      setActiveCountry: (code) =>
        set((state) => {
          const config = COUNTRY_CONFIGS[code];
          if (!config) return state;
          return {
            activeCountry: code,
            viewport: {
              ...state.viewport,
              ...config.viewport,
              bearing: 0,
              pitch: 0,
            },
          };
        }),
    }),
    {
      name: 'map-storage',
      partialize: (state) => ({
        viewport: state.viewport,
        activeCountry: state.activeCountry,
      }),
    }
  )
);
