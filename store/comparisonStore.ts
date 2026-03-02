import { create } from 'zustand';

export type AddToComparisonResult =
  | { success: true }
  | { success: false; reason: 'limit' | 'duplicate' };

interface ComparisonState {
  selectedIds: string[];
  addToComparison: (id: string) => AddToComparisonResult;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  isSelected: (id: string) => boolean;
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  selectedIds: [],

  addToComparison: (id) => {
    const state = get();
    if (state.selectedIds.length >= 3) {
      return { success: false, reason: 'limit' };
    }
    if (state.selectedIds.includes(id)) {
      return { success: false, reason: 'duplicate' };
    }
    set({ selectedIds: [...state.selectedIds, id] });
    return { success: true };
  },

  removeFromComparison: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.filter((existingId) => existingId !== id),
    })),

  clearComparison: () => set({ selectedIds: [] }),

  isSelected: (id) => get().selectedIds.includes(id),
}));
