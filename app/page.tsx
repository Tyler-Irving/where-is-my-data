'use client';

import { useState, useEffect, Suspense } from 'react';
import { Map, LayoutGrid } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FilterBar } from '@/components/map/FilterBar';
import { MapContainer } from '@/components/map/MapContainer';
import { DatacenterListView } from '@/components/datacenter-list/DatacenterListView';
import { MobileDatacenterList } from '@/components/datacenter-list/MobileDatacenterList';
import { ComparisonModal } from '@/components/modals/ComparisonModal';
import { ComparisonFooter } from '@/components/comparison/ComparisonFooter';
import { LatencyFooter } from '@/components/latency/LatencyFooter';
import { LatencyCalculator } from '@/components/latency/LatencyCalculator';
import { useUrlSync } from '@/hooks/useUrlSync';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useComparisonStore } from '@/store/comparisonStore';
import { useLatencyStore } from '@/store/latencyStore';
import { useMapStore } from '@/store/mapStore';
import { Toaster, toast } from 'sonner';

const activeTab = 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20 transition-all duration-200';
const inactiveTab = 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/40 hover:text-white/70 border border-transparent transition-all duration-200';

function HomeContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [latencyModalOpen, setLatencyModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'map' | 'list'>('map');

  const { datacenters } = useDatacenterStore();
  const { selectedIds, removeFromComparison, clearComparison } = useComparisonStore();
  const { selectedForLatency, removeFromLatency, clearLatencySelection } = useLatencyStore();
  const { viewport, setViewport } = useMapStore();

  // Get selected datacenters for comparison
  const comparisonDatacenters = datacenters.filter(dc => selectedIds.includes(dc.id));
  const canCompare = selectedIds.length >= 2;

  // Auto-close modal if selection drops below 2 (derived, no effect needed)
  const effectiveModalOpen = modalOpen && selectedIds.length >= 2;

  // Get selected datacenters for latency
  const latencyDatacenters = datacenters.filter(dc => selectedForLatency.includes(dc.id));
  const effectiveLatencyModalOpen = latencyModalOpen && selectedForLatency.length >= 2;

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

      // 'L' for latency
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        if (selectedForLatency.length >= 2) {
          setLatencyModalOpen(prev => !prev);
        } else {
          toast.info('Select at least 2 datacenters for latency', {
            description: 'Click "Latency" on datacenter tooltips to add them.',
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
        } else if (latencyModalOpen) {
          e.preventDefault();
          setLatencyModalOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canCompare, modalOpen, latencyModalOpen, selectedForLatency.length, viewport.zoom, setViewport]);

  return (
    <main className="bg-black h-dvh flex flex-col overflow-hidden">
      <Header />

      {/* View tab strip — desktop only */}
      <div className="hidden md:flex bg-black border-b border-white/[0.06] px-4 md:px-6 items-center gap-1.5 py-2 flex-shrink-0">
        <button onClick={() => setActiveView('map')} className={activeView === 'map' ? activeTab : inactiveTab}>
          <Map className="w-3 h-3" /> Map
        </button>
        <button onClick={() => setActiveView('list')} className={activeView === 'list' ? activeTab : inactiveTab}>
          <LayoutGrid className="w-3 h-3" /> Datacenters
        </button>
      </div>

      {/* Filter bar — desktop only */}
      <div className="hidden md:block flex-shrink-0">
        <FilterBar />
      </div>

      {/* Mobile: always show list */}
      <div className="md:hidden flex-1 min-h-0 overflow-hidden">
        <MobileDatacenterList />
      </div>

      {/* Desktop: tab-switched Map or List */}
      <div className="hidden md:flex relative flex-1 min-h-0">
        {activeView === 'map' ? <MapContainer /> : <DatacenterListView />}
      </div>
      <Footer />

      {/* Sticky footer stack — latency sits above comparison */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col">
        <LatencyFooter
          selectedDatacenters={latencyDatacenters}
          onCalculate={() => setLatencyModalOpen(true)}
          onClearAll={clearLatencySelection}
          onRemove={removeFromLatency}
        />
        <ComparisonFooter
          selectedDatacenters={comparisonDatacenters}
          onViewComparison={() => setModalOpen(true)}
          onClearAll={clearComparison}
          onRemove={removeFromComparison}
        />
      </div>

      {/* Comparison Modal - only opens when manually triggered AND ≥2 selected */}
      {effectiveModalOpen && comparisonDatacenters.length >= 2 && (
        <ComparisonModal
          datacenters={comparisonDatacenters}
          onClose={() => setModalOpen(false)}
          onRemove={removeFromComparison}
        />
      )}

      {/* Latency Calculator Modal */}
      <LatencyCalculator
        isOpen={effectiveLatencyModalOpen}
        onClose={() => setLatencyModalOpen(false)}
      />

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
