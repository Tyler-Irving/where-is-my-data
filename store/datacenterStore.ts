// Zustand store for datacenter data
import { create } from 'zustand';
import { Datacenter } from '@/types/datacenter';

interface DatacenterState {
  // Data
  datacenters: Datacenter[];
  lastFetched: number | null;
  
  // Actions
  setDatacenters: (datacenters: Datacenter[]) => void;
  clearCache: () => void;
}

export const useDatacenterStore = create<DatacenterState>((set) => ({
  datacenters: [],
  lastFetched: null,
  
  setDatacenters: (datacenters) =>
    set({ datacenters, lastFetched: Date.now() }),
  
  clearCache: () => set({ datacenters: [], lastFetched: null }),
}));
