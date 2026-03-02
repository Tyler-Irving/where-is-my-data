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

interface CostCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SliderProps {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step?: number;
  hint: string;
  onChange: (v: number) => void;
}

function Slider({ label, value, display, min, max, step = 1, hint, onChange }: SliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-white/60">{label}</label>
        <span className="font-mono text-sm text-[#00D084] font-bold tabular-nums">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-[#0066FF]" />
      <p className="mt-1 text-xs text-white/25">{hint}</p>
    </div>
  );
}

export function CostCalculator({ isOpen, onClose }: CostCalculatorProps) {
  const { customScenario, setCustomScenario, resetScenario } = usePricingStore();
  const selectedIds = useComparisonStore((state) => state.selectedIds);
  const countries = useFilterStore((state) => state.countries);

  if (!isOpen) return null;

  // Derive active country filter (only when exactly 1 country is selected)
  const activeCountry = countries.size === 1 ? [...countries][0] : null;

  let pool = getAllPricedDatacenters();
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
  const cheapest = getCheapestDatacenter(customScenario);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-[#0a0a0a] border border-white/[0.10] rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-up duration-300 flex flex-col">
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
              <Slider label="Compute Instances" value={customScenario.computeInstances}
                display={String(customScenario.computeInstances)} min={0} max={10}
                hint="8 vCPU, 16 GB RAM each"
                onChange={(v) => setCustomScenario({ computeInstances: v })} />
              <Slider label="Block Storage" value={customScenario.storageTb}
                display={`${customScenario.storageTb} TB`} min={0} max={50}
                hint="SSD block storage"
                onChange={(v) => setCustomScenario({ storageTb: v })} />
              <Slider label="Data Transfer (Egress)" value={customScenario.dataTransferTb}
                display={`${customScenario.dataTransferTb} TB`} min={0} max={100} step={5}
                hint="Outbound data transfer"
                onChange={(v) => setCustomScenario({ dataTransferTb: v })} />
              <Slider label="Database Instances" value={customScenario.databaseInstances}
                display={String(customScenario.databaseInstances)} min={0} max={5}
                hint="4 vCPU, 16 GB RAM each"
                onChange={(v) => setCustomScenario({ databaseInstances: v })} />
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
      </div>
    </div>
  );
}
