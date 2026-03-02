'use client';

import { X, Calculator, TrendingDown } from 'lucide-react';
import { usePricingStore } from '@/store/pricingStore';
import { useComparisonStore } from '@/store/comparisonStore';
import { useFilterStore } from '@/store/filterStore';
import {
  getAllPricedDatacenters,
  calculateScenarioEstimate,
  formatCurrency,
  getCheapestDatacenter,
} from '@/lib/utils/pricing';
import type { ScenarioEstimate } from '@/types/pricing';
import { Slider as UiSlider } from '@/components/ui/slider';
import { Dialog, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import { Dialog as DialogPrimitive } from 'radix-ui';

interface CostCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CostCalculator({ isOpen, onClose }: CostCalculatorProps) {
  const { customScenario, setCustomScenario, resetScenario, pricingData } = usePricingStore();
  const selectedIds = useComparisonStore((state) => state.selectedIds);
  const countries = useFilterStore((state) => state.countries);

  // Show loading state if pricing data hasn't been fetched yet
  if (pricingData === null) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogPortal>
          <DialogOverlay className="backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-full sm:max-w-4xl bg-[#0a0a0a] border border-white/[0.10] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col items-center justify-center py-16 gap-4 outline-none focus:outline-none">
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-white/35 hover:text-white hover:bg-white/[0.08] transition-all" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
            <Calculator className="h-8 w-8 text-[#00D084]/40" />
            <p className="text-sm text-white/35">Loading pricing data…</p>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    );
  }

  // Derive active country filter (only when exactly 1 country is selected)
  const activeCountry = countries.size === 1 ? [...countries][0] : null;

  let pool = getAllPricedDatacenters(pricingData);
  if (activeCountry) {
    pool = pool.filter(dc => dc.country === activeCountry);
  }
  const datacentersToCompare = selectedIds.length > 0
    ? pool.filter(dc => selectedIds.includes(dc.datacenterId))
    : pool;

  const estimates: ScenarioEstimate[] = datacentersToCompare
    .map(dc => calculateScenarioEstimate(dc, customScenario))
    .sort((a, b) => a.total - b.total);

  const minCost = estimates.length > 0 ? Math.min(...estimates.map(e => e.total)) : 0;
  const cheapest = getCheapestDatacenter(pricingData, customScenario);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-[#0a0a0a] border border-white/[0.10] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-2 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95 duration-200 outline-none focus:outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00D084]/15 border border-[#00D084]/20 flex items-center justify-center">
                <Calculator className="h-4 w-4 text-[#00D084]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Cost Calculator</h2>
                <p className="text-xs text-white/35">
                  {activeCountry ? `Showing ${activeCountry} regions` : 'Estimate costs across cloud regions'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/35 hover:text-white hover:bg-white/[0.08] transition-all" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Controls */}
            <div className="border-b border-white/[0.06] md:border-b-0 md:border-r p-5 overflow-y-auto scrollbar-hide md:w-[44%] md:flex-shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-4">Configure Workload</p>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-white/60">Compute Instances</label>
                    <span className="font-mono text-sm text-[#00D084] font-bold tabular-nums">{String(customScenario.computeInstances)}</span>
                  </div>
                  <UiSlider min={0} max={10} step={1} value={[customScenario.computeInstances]} onValueChange={(values) => setCustomScenario({ computeInstances: values[0] })} className="w-full" />
                  <p className="mt-1 text-xs text-white/25">8 vCPU, 16 GB RAM each</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-white/60">Block Storage</label>
                    <span className="font-mono text-sm text-[#00D084] font-bold tabular-nums">{`${customScenario.storageTb} TB`}</span>
                  </div>
                  <UiSlider min={0} max={50} step={1} value={[customScenario.storageTb]} onValueChange={(values) => setCustomScenario({ storageTb: values[0] })} className="w-full" />
                  <p className="mt-1 text-xs text-white/25">SSD block storage</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-white/60">Data Transfer (Egress)</label>
                    <span className="font-mono text-sm text-[#00D084] font-bold tabular-nums">{`${customScenario.dataTransferTb} TB`}</span>
                  </div>
                  <UiSlider min={0} max={100} step={5} value={[customScenario.dataTransferTb]} onValueChange={(values) => setCustomScenario({ dataTransferTb: values[0] })} className="w-full" />
                  <p className="mt-1 text-xs text-white/25">Outbound data transfer</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-white/60">Database Instances</label>
                    <span className="font-mono text-sm text-[#00D084] font-bold tabular-nums">{String(customScenario.databaseInstances)}</span>
                  </div>
                  <UiSlider min={0} max={5} step={1} value={[customScenario.databaseInstances]} onValueChange={(values) => setCustomScenario({ databaseInstances: values[0] })} className="w-full" />
                  <p className="mt-1 text-xs text-white/25">4 vCPU, 16 GB RAM each</p>
                </div>
                <button onClick={resetScenario}
                  className="w-full rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/[0.05] transition-all">
                  Reset to Baseline
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="p-5 overflow-y-auto scrollbar-hide md:flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">Estimated Monthly Cost</p>
                {cheapest && (
                  <div className="flex items-center gap-1 text-xs text-[#00D084]">
                    <TrendingDown className="h-3 w-3" />
                    <span>Best: {cheapest.displayName}</span>
                  </div>
                )}
              </div>

              {estimates.length === 0 ? (
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center">
                  <p className="text-sm text-white/40">
                    {activeCountry ? `No pricing data for ${activeCountry} regions yet` : 'No priced regions available'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {estimates.map((estimate) => {
                    const isMin = estimate.total === minCost;
                    const relativePercent = isMin ? 0 : Math.round(((estimate.total - minCost) / minCost) * 100);
                    return (
                      <div key={estimate.datacenterId}
                        className={`rounded-xl border p-3.5 transition-all ${isMin ? 'border-[#00D084]/30 bg-[#00D084]/5' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">{estimate.displayName}</p>
                            <p className="text-xs text-white/40">{estimate.provider}</p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <p className="text-xl font-bold text-white tabular-nums">{formatCurrency(estimate.total, false)}</p>
                            {isMin
                              ? <p className="text-xs text-[#00D084] font-semibold">Cheapest</p>
                              : <p className="text-xs text-[#FF9500]">+{relativePercent}%</p>
                            }
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          {[
                            ['Compute', estimate.breakdown.compute],
                            ['Storage', estimate.breakdown.storage],
                            ['Transfer', estimate.breakdown.dataTransfer],
                            ['Database', estimate.breakdown.database],
                          ].map(([label, val]) => (
                            <div key={label as string} className="flex justify-between">
                              <span className="text-white/30">{label}:</span>
                              <span className="text-white/60 tabular-nums">{formatCurrency(val as number)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-xs text-white/30">
                <strong className="text-white/50">Note:</strong> On-demand pricing. Reserved or spot instances can reduce costs by 30–70%.
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
