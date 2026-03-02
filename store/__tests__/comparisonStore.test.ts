import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock sonner so toast calls inside the store do not throw in the Node test
// environment (sonner relies on browser globals not present in Node).
vi.mock('sonner', () => ({
  toast: {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

// Import AFTER the mock is registered so the store module picks up the mock.
import { useComparisonStore } from '../comparisonStore';

// Reset Zustand store state before every test so tests are fully isolated.
beforeEach(() => {
  useComparisonStore.setState({ selectedIds: [] });
});

describe('comparisonStore', () => {
  describe('addToComparison', () => {
    it('adds a DC id so selectedIds grows to include it', () => {
      useComparisonStore.getState().addToComparison('dc-1');
      expect(useComparisonStore.getState().selectedIds).toEqual(['dc-1']);
    });

    it('adding the same DC twice results in no duplicate — stays length 1', () => {
      const { addToComparison } = useComparisonStore.getState();
      addToComparison('dc-1');
      addToComparison('dc-1');
      expect(useComparisonStore.getState().selectedIds).toHaveLength(1);
      expect(useComparisonStore.getState().selectedIds).toEqual(['dc-1']);
    });

    it('adding a 4th DC when 3 are already selected is rejected — stays length 3', () => {
      const { addToComparison } = useComparisonStore.getState();
      addToComparison('dc-1');
      addToComparison('dc-2');
      addToComparison('dc-3');
      addToComparison('dc-4');
      const { selectedIds } = useComparisonStore.getState();
      expect(selectedIds).toHaveLength(3);
      expect(selectedIds).not.toContain('dc-4');
    });

    it('can hold up to 3 distinct DCs', () => {
      const { addToComparison } = useComparisonStore.getState();
      addToComparison('dc-a');
      addToComparison('dc-b');
      addToComparison('dc-c');
      expect(useComparisonStore.getState().selectedIds).toEqual(['dc-a', 'dc-b', 'dc-c']);
    });
  });

  describe('removeFromComparison', () => {
    it('removes a DC id so selectedIds shrinks', () => {
      useComparisonStore.setState({ selectedIds: ['dc-1', 'dc-2', 'dc-3'] });
      useComparisonStore.getState().removeFromComparison('dc-2');
      expect(useComparisonStore.getState().selectedIds).toEqual(['dc-1', 'dc-3']);
    });

    it('removing a DC id that is not selected leaves the list unchanged', () => {
      useComparisonStore.setState({ selectedIds: ['dc-1', 'dc-2'] });
      useComparisonStore.getState().removeFromComparison('dc-99');
      expect(useComparisonStore.getState().selectedIds).toEqual(['dc-1', 'dc-2']);
    });
  });

  describe('isSelected', () => {
    it('returns true when the id is in selectedIds', () => {
      useComparisonStore.setState({ selectedIds: ['dc-1', 'dc-2'] });
      expect(useComparisonStore.getState().isSelected('dc-1')).toBe(true);
    });

    it('returns false when the id is not in selectedIds', () => {
      useComparisonStore.setState({ selectedIds: ['dc-1', 'dc-2'] });
      expect(useComparisonStore.getState().isSelected('dc-99')).toBe(false);
    });

    it('returns false when selectedIds is empty', () => {
      expect(useComparisonStore.getState().isSelected('dc-1')).toBe(false);
    });
  });

  describe('clearComparison', () => {
    it('resets selectedIds to an empty array', () => {
      useComparisonStore.setState({ selectedIds: ['dc-1', 'dc-2', 'dc-3'] });
      useComparisonStore.getState().clearComparison();
      expect(useComparisonStore.getState().selectedIds).toEqual([]);
    });

    it('calling clearComparison on an already-empty store is a no-op', () => {
      useComparisonStore.getState().clearComparison();
      expect(useComparisonStore.getState().selectedIds).toEqual([]);
    });
  });
});
