// Zustand store for map state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

  // Actions
  setViewport: (viewport: Partial<ViewportState>) => void;
  selectDatacenter: (id: string | null) => void;
}

const initialViewport: ViewportState = {
  latitude: 37.0902,
  longitude: -95.7129,
  zoom: 4,
  bearing: 0,
  pitch: 0,
};

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      viewport: initialViewport,
      selectedDatacenter: null,

      setViewport: (viewport) =>
        set((state) => ({
          viewport: { ...state.viewport, ...viewport }
        })),

      selectDatacenter: (id) => set({ selectedDatacenter: id }),
    }),
    {
      name: 'map-storage',
      partialize: (state) => ({
        viewport: state.viewport,
      }),
    }
  )
);
