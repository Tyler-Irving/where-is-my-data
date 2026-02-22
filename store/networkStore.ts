import { create } from 'zustand';
import type { NetworkConnectionType } from '@/types/network';

interface NetworkState {
  // Visualization settings
  showBackbone: boolean;
  selectedProviders: string[];
  selectedConnectionTypes: NetworkConnectionType[];
  showLabels: boolean;
  animate: boolean;
  lineWidth: number;
  opacity: number;
  
  // Hover state
  hoveredConnectionId: string | null;
  
  // Actions
  toggleBackbone: () => void;
  setShowBackbone: (show: boolean) => void;
  toggleProvider: (provider: string) => void;
  setSelectedProviders: (providers: string[]) => void;
  clearProviders: () => void;
  toggleConnectionType: (type: NetworkConnectionType) => void;
  setSelectedConnectionTypes: (types: NetworkConnectionType[]) => void;
  setShowLabels: (show: boolean) => void;
  setAnimate: (animate: boolean) => void;
  setLineWidth: (width: number) => void;
  setOpacity: (opacity: number) => void;
  setHoveredConnectionId: (id: string | null) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  showBackbone: false,
  selectedProviders: [],
  selectedConnectionTypes: ['backbone' as NetworkConnectionType],
  showLabels: false,
  animate: true,
  lineWidth: 2,
  opacity: 0.7,
  hoveredConnectionId: null,
};

export const useNetworkStore = create<NetworkState>((set) => ({
  ...DEFAULT_STATE,
  
  toggleBackbone: () =>
    set((state) => ({ showBackbone: !state.showBackbone })),
  
  setShowBackbone: (show) =>
    set({ showBackbone: show }),
  
  toggleProvider: (provider) =>
    set((state) => {
      const providers = state.selectedProviders;
      const index = providers.indexOf(provider);
      if (index >= 0) {
        return { selectedProviders: providers.filter(p => p !== provider) };
      } else {
        return { selectedProviders: [...providers, provider] };
      }
    }),
  
  setSelectedProviders: (providers) =>
    set({ selectedProviders: providers }),
  
  clearProviders: () =>
    set({ selectedProviders: [] }),
  
  toggleConnectionType: (type) =>
    set((state) => {
      const types = state.selectedConnectionTypes;
      const index = types.indexOf(type);
      if (index >= 0) {
        return { selectedConnectionTypes: types.filter(t => t !== type) };
      } else {
        return { selectedConnectionTypes: [...types, type] };
      }
    }),
  
  setSelectedConnectionTypes: (types) =>
    set({ selectedConnectionTypes: types }),
  
  setShowLabels: (show) =>
    set({ showLabels: show }),
  
  setAnimate: (animate) =>
    set({ animate: animate }),
  
  setLineWidth: (width) =>
    set({ lineWidth: width }),
  
  setOpacity: (opacity) =>
    set({ opacity: opacity }),
  
  setHoveredConnectionId: (id) =>
    set({ hoveredConnectionId: id }),
  
  reset: () =>
    set(DEFAULT_STATE),
}));
