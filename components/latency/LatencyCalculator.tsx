'use client';

import { useMemo } from 'react';
import { X, Zap, TrendingUp, MapPin } from 'lucide-react';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useLatencyStore } from '@/store/latencyStore';
import {
  calculateLatencyBetween,
  calculateMultiRegionLatency,
  formatLatency,
  getLatencyColor,
  createLatencyRoute,
} from '@/lib/utils/latency';

interface LatencyCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LatencyCalculator({ isOpen, onClose }: LatencyCalculatorProps) {
  const datacenters = useDatacenterStore((state) => state.datacenters);
  const { selectedForLatency, clearLatencySelection, setActiveRoutes } = useLatencyStore();
  
  const selectedDatacenters = useMemo(
    () => datacenters.filter(dc => selectedForLatency.includes(dc.id)),
    [datacenters, selectedForLatency]
  );
  
  const latencyData = useMemo(() => {
    if (selectedDatacenters.length < 2) return null;
    return calculateMultiRegionLatency(selectedDatacenters);
  }, [selectedDatacenters]);
  
  const handleVisualize = () => {
    if (!latencyData) return;
    
    const routes = latencyData.pairwiseLatencies.map(estimate => {
      const dc1 = selectedDatacenters.find(dc => dc.id === estimate.fromDatacenterId)!;
      const dc2 = selectedDatacenters.find(dc => dc.id === estimate.toDatacenterId)!;
      return createLatencyRoute(dc1, dc2, estimate);
    });
    
    setActiveRoutes(routes);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Latency Calculator</h2>
              <p className="text-sm text-zinc-400">
                Estimate network latency between datacenters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            aria-label="Close calculator"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
          {selectedDatacenters.length === 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-8 text-center">
              <Zap className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
              <h3 className="mb-2 text-lg font-semibold text-white">
                No Datacenters Selected
              </h3>
              <p className="text-zinc-400">
                Click on datacenters in the map to add them to latency calculation.
                Select at least 2 datacenters to see latency estimates.
              </p>
            </div>
          )}
          
          {selectedDatacenters.length === 1 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-8 text-center">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-blue-400" />
              <h3 className="mb-2 text-lg font-semibold text-white">
                1 Datacenter Selected
              </h3>
              <p className="mb-4 text-zinc-400">
                Add at least one more datacenter to calculate latency.
              </p>
              <div className="rounded-lg bg-zinc-800 p-4">
                <div className="text-sm font-medium text-white">
                  {selectedDatacenters[0].metadata?.displayName || selectedDatacenters[0].name}
                </div>
                <div className="text-xs text-zinc-400">
                  {selectedDatacenters[0].city}, {selectedDatacenters[0].state}
                </div>
              </div>
            </div>
          )}
          
          {latencyData && (
            <>
              {/* Summary Stats */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-zinc-800/50 p-4">
                  <div className="mb-1 text-xs text-zinc-400">Datacenters</div>
                  <div className="text-2xl font-bold text-white">
                    {selectedDatacenters.length}
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-800/50 p-4">
                  <div className="mb-1 text-xs text-zinc-400">Avg Latency</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatLatency(latencyData.averageLatency)}
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-800/50 p-4">
                  <div className="mb-1 text-xs text-zinc-400">Max Latency</div>
                  <div className="text-2xl font-bold text-orange-400">
                    {formatLatency(latencyData.maxLatency)}
                  </div>
                </div>
              </div>
              
              {/* Selected Datacenters */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-white">
                  Selected Datacenters
                </h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {selectedDatacenters.map((dc) => (
                    <div
                      key={dc.id}
                      className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">
                          {dc.metadata?.displayName || dc.name}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {dc.provider} • {dc.city}, {dc.state}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Pairwise Latencies */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-white">
                  Pairwise Latencies
                </h3>
                <div className="space-y-2">
                  {latencyData.pairwiseLatencies.map((estimate, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-4"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">
                            {estimate.fromDisplayName} → {estimate.toDisplayName}
                          </div>
                          <div className="mt-1 text-xs text-zinc-400">
                            {estimate.distanceKm.toLocaleString()} km ({estimate.distanceMiles.toLocaleString()} mi)
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className="text-lg font-bold"
                            style={{ color: getLatencyColor(estimate.estimatedLatencyMs) }}
                          >
                            {formatLatency(estimate.estimatedLatencyMs)}
                          </div>
                          <div className="text-xs capitalize text-zinc-400">
                            {estimate.category}
                          </div>
                        </div>
                      </div>
                      {estimate.notes && (
                        <div className="mt-2 rounded bg-zinc-900/50 p-2 text-xs text-zinc-400">
                          {estimate.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Visualize Button */}
              <button
                onClick={handleVisualize}
                className="mt-6 w-full rounded-lg bg-blue-500 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-600"
              >
                <TrendingUp className="mr-2 inline-block h-4 w-4" />
                Visualize on Map
              </button>
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-500">
              Estimates based on geographic distance and typical network topology
            </div>
            <button
              onClick={() => {
                clearLatencySelection();
                onClose();
              }}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
