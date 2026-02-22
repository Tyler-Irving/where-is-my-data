import { create } from 'zustand';
import type { CustomScenario } from '@/types/pricing';

interface PricingState {
  // Calculator state
  customScenario: CustomScenario;
  setCustomScenario: (scenario: Partial<CustomScenario>) => void;
  resetScenario: () => void;
  
  // Display state
  showPricing: boolean;
  togglePricing: () => void;
  
  // Cost filter
  maxMonthlyCost: number | null;
  setMaxMonthlyCost: (max: number | null) => void;
}

const DEFAULT_SCENARIO: CustomScenario = {
  computeInstances: 1,
  storageTb: 1,
  dataTransferTb: 10,
  databaseInstances: 1,
};

export const usePricingStore = create<PricingState>((set) => ({
  // Calculator state
  customScenario: DEFAULT_SCENARIO,
  setCustomScenario: (scenario) =>
    set((state) => ({
      customScenario: { ...state.customScenario, ...scenario },
    })),
  resetScenario: () =>
    set({ customScenario: DEFAULT_SCENARIO }),
  
  // Display state
  showPricing: true,
  togglePricing: () =>
    set((state) => ({ showPricing: !state.showPricing })),
  
  // Cost filter
  maxMonthlyCost: null,
  setMaxMonthlyCost: (max) =>
    set({ maxMonthlyCost: max }),
}));
