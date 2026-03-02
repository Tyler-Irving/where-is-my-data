// Zustand store for datacenter filters
import { create } from 'zustand';
import { ProviderType } from '@/types/datacenter';

export interface FilterState {
  // Active filters
  providers: Set<string>;
  providerTypes: Set<ProviderType>;
  countries: Set<string>;
  capacityRange: [number, number]; // MW
  pueRange: [number, number];
  renewableOnly: boolean;

  // UI state
  isPanelOpen: boolean;

  // Actions
  toggleProvider: (provider: string) => void;
  toggleProviderType: (type: ProviderType) => void;
  toggleCountry: (country: string) => void;
  setCountry: (code: string) => void;
  clearCountry: () => void;
  setCapacityRange: (range: [number, number]) => void;
  setPueRange: (range: [number, number]) => void;
  setRenewableOnly: (value: boolean) => void;
  togglePanel: () => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
}

const DEFAULT_CAPACITY_RANGE: [number, number] = [0, 500]; // 0-500 MW
const DEFAULT_PUE_RANGE: [number, number] = [1.0, 2.0];

export const useFilterStore = create<FilterState>((set, get) => ({
  providers: new Set(),
  providerTypes: new Set(),
  countries: new Set(),
  capacityRange: DEFAULT_CAPACITY_RANGE,
  pueRange: DEFAULT_PUE_RANGE,
  renewableOnly: false,
  isPanelOpen: false,
  
  toggleProvider: (provider) =>
    set((state) => {
      const newSet = new Set(state.providers);
      if (newSet.has(provider)) {
        newSet.delete(provider);
      } else {
        newSet.add(provider);
      }
      return { providers: newSet };
    }),
  
  toggleProviderType: (type) =>
    set((state) => {
      const newSet = new Set(state.providerTypes);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return { providerTypes: newSet };
    }),

  toggleCountry: (country) =>
    set((state) => {
      const newSet = new Set(state.countries);
      if (newSet.has(country)) {
        newSet.delete(country);
      } else {
        newSet.add(country);
      }
      return { countries: newSet };
    }),

  setCountry: (code) => set({ countries: new Set([code]) }),

  clearCountry: () => set({ countries: new Set() }),

  setCapacityRange: (range) => set({ capacityRange: range }),
  
  setPueRange: (range) => set({ pueRange: range }),
  
  setRenewableOnly: (value) => set({ renewableOnly: value }),
  
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  
  clearFilters: () =>
    set({
      providers: new Set(),
      providerTypes: new Set(),
      countries: new Set(),
      capacityRange: DEFAULT_CAPACITY_RANGE,
      pueRange: DEFAULT_PUE_RANGE,
      renewableOnly: false,
    }),

  hasActiveFilters: () => {
    const state = get();
    return (
      state.providers.size > 0 ||
      state.providerTypes.size > 0 ||
      state.countries.size > 0 ||
      state.capacityRange[0] !== DEFAULT_CAPACITY_RANGE[0] ||
      state.capacityRange[1] !== DEFAULT_CAPACITY_RANGE[1] ||
      state.pueRange[0] !== DEFAULT_PUE_RANGE[0] ||
      state.pueRange[1] !== DEFAULT_PUE_RANGE[1] ||
      state.renewableOnly
    );
  },
}));
