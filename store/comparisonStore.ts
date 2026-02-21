import { create } from 'zustand';
import { toast } from 'sonner';

interface ComparisonState {
  selectedIds: string[];
  addToComparison: (id: string) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  isSelected: (id: string) => boolean;
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  selectedIds: [],
  
  addToComparison: (id) =>
    set((state) => {
      if (state.selectedIds.length >= 3) {
        // Max 3 datacenters - show toast notification
        toast.warning('Maximum 3 datacenters can be compared.', {
          description: 'Deselect one to add another.',
          duration: 4000,
        });
        return state;
      }
      if (state.selectedIds.includes(id)) {
        return state;
      }
      return { selectedIds: [...state.selectedIds, id] };
    }),
  
  removeFromComparison: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.filter((existingId) => existingId !== id),
    })),
  
  clearComparison: () => set({ selectedIds: [] }),
  
  isSelected: (id) => get().selectedIds.includes(id),
}));
