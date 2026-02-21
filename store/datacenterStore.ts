// Zustand store for datacenter data
import { create } from 'zustand';
import { HexagonData } from '@/types/hexagon';
import { Datacenter } from '@/types/datacenter';

interface DatacenterState {
  // Data
  hexagons: Map<string, HexagonData>;
  datacenters: Datacenter[];
  lastFetched: number | null;
  
  // Actions
  setHexagons: (hexagons: HexagonData[]) => void;
  setDatacenters: (datacenters: Datacenter[]) => void;
  updateHexagon: (h3Index: string, updates: Partial<HexagonData>) => void;
  getHexagon: (h3Index: string) => HexagonData | undefined;
  clearCache: () => void;
}

export const useDatacenterStore = create<DatacenterState>((set, get) => ({
  hexagons: new Map(),
  datacenters: [],
  lastFetched: null,
  
  setHexagons: (hexagons) =>
    set({
      hexagons: new Map(hexagons.map(h => [h.h3Index, h])),
      lastFetched: Date.now(),
    }),
  
  setDatacenters: (datacenters) =>
    set({ datacenters }),
  
  updateHexagon: (h3Index, updates) =>
    set((state) => {
      const newMap = new Map(state.hexagons);
      const existing = newMap.get(h3Index);
      if (existing) {
        newMap.set(h3Index, { ...existing, ...updates });
      }
      return { hexagons: newMap };
    }),
  
  getHexagon: (h3Index) => {
    return get().hexagons.get(h3Index);
  },
  
  clearCache: () => set({ hexagons: new Map(), lastFetched: null }),
}));
