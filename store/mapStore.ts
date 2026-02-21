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

export interface FilterState {
  providers: string[];
}

interface MapState {
  // View state
  viewport: ViewportState;
  
  // Filter state
  filters: FilterState;
  
  // UI state
  selectedHexagon: string | null;
  selectedDatacenter: string | null;
  hoveredHexagon: string | null;
  isLoading: boolean;
  
  // Actions
  setViewport: (viewport: Partial<ViewportState>) => void;
  setFilter: (key: keyof FilterState, value: any) => void;
  selectHexagon: (h3Index: string | null) => void;
  selectDatacenter: (id: string | null) => void;
  setHoveredHexagon: (h3Index: string | null) => void;
  setLoading: (loading: boolean) => void;
  resetFilters: () => void;
}

const initialViewport: ViewportState = {
  latitude: 37.0902,
  longitude: -95.7129,
  zoom: 4,
  bearing: 0,
  pitch: 0,
};

const initialFilters: FilterState = {
  providers: [],
};

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      viewport: initialViewport,
      filters: initialFilters,
      selectedHexagon: null,
      selectedDatacenter: null,
      hoveredHexagon: null,
      isLoading: false,
      
      setViewport: (viewport) => 
        set((state) => ({ 
          viewport: { ...state.viewport, ...viewport } 
        })),
      
      setFilter: (key, value) =>
        set((state) => ({ 
          filters: { ...state.filters, [key]: value } 
        })),
      
      selectHexagon: (h3Index) => set({ selectedHexagon: h3Index }),
      
      selectDatacenter: (id) => set({ selectedDatacenter: id }),
      
      setHoveredHexagon: (h3Index) => set({ hoveredHexagon: h3Index }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      resetFilters: () => set({ filters: initialFilters }),
    }),
    {
      name: 'map-storage',
      partialize: (state) => ({ 
        viewport: state.viewport, 
        filters: state.filters 
      }),
    }
  )
);
