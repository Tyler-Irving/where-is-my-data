'use client';

import { useMemo } from 'react';
import { X, Zap, TrendingUp, MapPin } from 'lucide-react';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useLatencyStore } from '@/store/latencyStore';
import {
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-[#0a0a0a] border border-white/[0.10] rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-up duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0066FF]/15 border border-[#0066FF]/20 flex items-center justify-center">
              <Zap className="h-4 w-4 text-[#0066FF]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Latency Calculator</h2>
              <p className="text-xs text-white/35">Estimate network latency between datacenters</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/35 hover:text-white hover:bg-white/[0.08] transition-all" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto scrollbar-hide max-h-[calc(92vh-160px)] sm:max-h-[calc(90vh-160px)] p-5">
          {/* Empty states */}
          {selectedDatacenters.length === 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-10 text-center">
              <Zap className="mx-auto mb-4 h-10 w-10 text-white/15" />
              <h3 className="mb-2 text-base font-bold text-white">No Datacenters Selected</h3>
              <p className="text-sm text-white/40 max-w-xs mx-auto">Click &quot;Latency&quot; on a datacenter tooltip to select it. Select at least 2 to calculate.</p>
            </div>
          )}

          {selectedDatacenters.length === 1 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-10 text-center">
              <MapPin className="mx-auto mb-4 h-10 w-10 text-[#0066FF]/40" />
              <h3 className="mb-2 text-base font-bold text-white">1 Datacenter Selected</h3>
              <p className="mb-4 text-sm text-white/40">Select one more to calculate latency.</p>
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 inline-block">
                <p className="text-sm font-semibold text-white">{selectedDatacenters[0].metadata?.displayName || selectedDatacenters[0].name}</p>
                <p className="text-xs text-white/40 mt-0.5">{selectedDatacenters[0].city}, {selectedDatacenters[0].state}</p>
              </div>
            </div>
          )}

          {latencyData && (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Datacenters', value: selectedDatacenters.length, color: 'text-white' },
                  { label: 'Avg Latency', value: formatLatency(latencyData.averageLatency), color: 'text-[#0066FF]' },
                  { label: 'Max Latency', value: formatLatency(latencyData.maxLatency), color: 'text-[#FF9500]' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/[0.04] rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">{s.label}</p>
                    <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Selected DCs */}
              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Selected</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {selectedDatacenters.map((dc) => (
                    <div key={dc.id} className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl p-3">
                      <div className="w-2 h-2 rounded-full bg-[#0066FF] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{dc.metadata?.displayName || dc.name}</p>
                        <p className="text-xs text-white/40">{dc.provider} · {dc.city}, {dc.state}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pairwise latencies */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Pairwise Latency</p>
                <div className="space-y-2">
                  {latencyData.pairwiseLatencies.map((estimate, idx) => (
                    <div key={idx} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{estimate.fromDisplayName} → {estimate.toDisplayName}</p>
                          <p className="text-xs text-white/35 mt-0.5">{estimate.distanceKm.toLocaleString()} km · {estimate.distanceMiles.toLocaleString()} mi</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-bold tabular-nums" style={{ color: getLatencyColor(estimate.estimatedLatencyMs) }}>
                            {formatLatency(estimate.estimatedLatencyMs)}
                          </p>
                          <p className="text-xs text-white/35 capitalize mt-0.5">{estimate.category}</p>
                        </div>
                      </div>
                      {estimate.notes && (
                        <p className="text-xs text-white/30 bg-white/[0.03] rounded-lg px-2 py-1.5 mt-2">{estimate.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleVisualize}
                className="mt-6 w-full bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold rounded-xl px-4 py-3 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Visualize on Map
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
          <p className="text-xs text-white/25">Distance-based estimates</p>
          <button
            onClick={() => { clearLatencySelection(); onClose(); }}
            className="px-4 py-2 rounded-xl border border-white/[0.08] text-sm text-white/50 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            Clear & Close
          </button>
        </div>
      </div>
    </div>
  );
}
