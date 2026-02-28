'use client';

import { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FilterBar } from '@/components/map/FilterBar';
import { MapContainer } from '@/components/map/MapContainer';
import { ComparisonModal } from '@/components/modals/ComparisonModal';
import { ComparisonFooter } from '@/components/comparison/ComparisonFooter';
import { useUrlSync } from '@/hooks/useUrlSync';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useComparisonStore } from '@/store/comparisonStore';
import { useMapStore } from '@/store/mapStore';
import { Toaster, toast } from 'sonner';

function HomeContent() {
  const [modalOpen, setModalOpen] = useState(false);
  
  const { datacenters } = useDatacenterStore();
  const { selectedIds, removeFromComparison, clearComparison } = useComparisonStore();
  const { viewport, setViewport } = useMapStore();
  
  // Get selected datacenters for comparison
  const comparisonDatacenters = datacenters.filter(dc => selectedIds.includes(dc.id));
  const canCompare = selectedIds.length >= 2;

  // Auto-close modal if selection drops below 2 (derived, no effect needed)
  const effectiveModalOpen = modalOpen && selectedIds.length >= 2;

  // Sync filters with URL params
  useUrlSync();
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input (except for ESC)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key !== 'Escape') {
          return;
        }
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
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canCompare, modalOpen, viewport.zoom, setViewport]);
  
  return (
    <main className="bg-black min-h-screen md:h-screen md:flex md:flex-col md:overflow-hidden">
      <Header />
      <FilterBar />
      <div className="relative md:flex-1 md:min-h-0">
        <MapContainer />
      </div>
      <Footer />
      
      {/* Comparison Footer (sticky bottom bar) */}
      <ComparisonFooter
        selectedDatacenters={comparisonDatacenters}
        onViewComparison={() => setModalOpen(true)}
        onClearAll={clearComparison}
        onRemove={removeFromComparison}
      />
      
      {/* Comparison Modal - only opens when manually triggered AND ≥2 selected */}
      {effectiveModalOpen && comparisonDatacenters.length >= 2 && (
        <ComparisonModal
          datacenters={comparisonDatacenters}
          onClose={() => setModalOpen(false)}
          onRemove={removeFromComparison}
        />
      )}
      
      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#ffffff',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          },
        }}
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
