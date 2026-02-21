'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FilterBar } from '@/components/map/FilterBar';
import { MapContainer } from '@/components/map/MapContainer';
import { ComparisonModal } from '@/components/modals/ComparisonModal';
import { KeyboardShortcutsModal } from '@/components/modals/KeyboardShortcutsModal';
import { ComparisonFooter } from '@/components/comparison/ComparisonFooter';
import { useUrlSync } from '@/hooks/useUrlSync';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useComparisonStore } from '@/store/comparisonStore';
import { useMapStore } from '@/store/mapStore';
import { Toaster } from 'sonner';
import { toast } from 'sonner';

export default function Home() {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  const { datacenters } = useDatacenterStore();
  const { selectedIds, removeFromComparison, clearComparison } = useComparisonStore();
  const { viewport, setViewport } = useMapStore();
  
  // Get selected datacenters for comparison
  const comparisonDatacenters = datacenters.filter(dc => selectedIds.includes(dc.id));
  const canCompare = selectedIds.length >= 2;
  
  // Sync filters with URL params
  useUrlSync();
  
  // Auto-close modal if selection drops below 2
  useEffect(() => {
    if (modalOpen && selectedIds.length < 2) {
      setModalOpen(false);
    }
  }, [selectedIds.length, modalOpen]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input (except for ESC)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key !== 'Escape') {
          return;
        }
      }
      
      // '?' to show keyboard shortcuts
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(true);
      }
      
      // 'C' for comparison
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        if (canCompare) {
          setModalOpen(prev => !prev); // Toggle modal
        } else {
          toast.info('Select at least 2 datacenters to compare', {
            description: 'Click "Compare" on datacenter tooltips to add them.',
            duration: 3000,
          });
        }
      }
      
      // '+' or '=' to zoom in
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setViewport({ zoom: Math.min(viewport.zoom + 1, 12) });
      }
      
      // '-' or '_' to zoom out
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setViewport({ zoom: Math.max(viewport.zoom - 1, 3) });
      }
      
      // ESC to close modals
      if (e.key === 'Escape') {
        if (modalOpen) {
          e.preventDefault();
          setModalOpen(false);
        } else if (showShortcuts) {
          e.preventDefault();
          setShowShortcuts(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canCompare, modalOpen, showShortcuts, viewport.zoom, setViewport]);
  
  return (
    <main className="min-h-screen bg-gray-900">
      <Header />
      <FilterBar />
      <MapContainer />
      <Footer />
      
      {/* Comparison Footer (sticky bottom bar) */}
      <ComparisonFooter
        selectedDatacenters={comparisonDatacenters}
        onViewComparison={() => setModalOpen(true)}
        onClearAll={clearComparison}
        onRemove={removeFromComparison}
      />
      
      {/* Comparison Modal - only opens when manually triggered AND ≥2 selected */}
      {modalOpen && comparisonDatacenters.length >= 2 && (
        <ComparisonModal
          datacenters={comparisonDatacenters}
          onClose={() => setModalOpen(false)}
          onRemove={removeFromComparison}
        />
      )}
      
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#27272a',
            border: '1px solid #3f3f46',
            color: '#fafafa',
          },
        }}
      />
    </main>
  );
}
