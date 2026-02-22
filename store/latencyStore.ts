import { create } from 'zustand';
import type { LatencyRoute } from '@/types/latency';

interface LatencyState {
  // Selected datacenters for latency calculation
  selectedForLatency: string[];
  
  // Active latency routes to display on map
  activeRoutes: LatencyRoute[];
  
  // Actions
  addToLatency: (datacenterId: string) => void;
  removeFromLatency: (datacenterId: string) => void;
  clearLatencySelection: () => void;
  setActiveRoutes: (routes: LatencyRoute[]) => void;
  clearRoutes: () => void;
}

export const useLatencyStore = create<LatencyState>((set) => ({
  selectedForLatency: [],
  activeRoutes: [],
  
  addToLatency: (datacenterId) =>
    set((state) => {
      if (state.selectedForLatency.includes(datacenterId)) return state;
      return { selectedForLatency: [...state.selectedForLatency, datacenterId] };
    }),
  
  removeFromLatency: (datacenterId) =>
    set((state) => ({
      selectedForLatency: state.selectedForLatency.filter(id => id !== datacenterId),
    })),
  
  clearLatencySelection: () =>
    set({ selectedForLatency: [], activeRoutes: [] }),
  
  setActiveRoutes: (routes) =>
    set({ activeRoutes: routes }),
  
  clearRoutes: () =>
    set({ activeRoutes: [] }),
}));
