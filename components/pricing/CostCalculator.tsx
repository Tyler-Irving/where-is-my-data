'use client';

import { useState } from 'react';
import { X, Calculator, TrendingDown } from 'lucide-react';
import { usePricingStore } from '@/store/pricingStore';
import { useComparisonStore } from '@/store/comparisonStore';
import { 
  getAllPricedDatacenters, 
  calculateScenarioEstimate, 
  formatCurrency,
  getCheapestDatacenter 
} from '@/lib/utils/pricing';
import type { ScenarioEstimate } from '@/types/pricing';

interface CostCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CostCalculator({ isOpen, onClose }: CostCalculatorProps) {
  const { customScenario, setCustomScenario, resetScenario } = usePricingStore();
  const selectedIds = useComparisonStore((state) => state.selectedIds);
  
  if (!isOpen) return null;
  
  // Calculate estimates for selected datacenters or all if none selected
  const datacentersToCompare = selectedIds.length > 0
    ? getAllPricedDatacenters().filter(dc => selectedIds.includes(dc.datacenterId))
    : getAllPricedDatacenters();
  
  const estimates: ScenarioEstimate[] = datacentersToCompare
    .map(dc => calculateScenarioEstimate(dc, customScenario))
    .sort((a, b) => a.total - b.total);
  
  const minCost = Math.min(...estimates.map(e => e.total));
  const cheapest = getCheapestDatacenter(customScenario);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-green-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Cost Calculator</h2>
              <p className="text-sm text-zinc-400">Estimate costs across datacenters</p>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Controls */}
          <div className="border-b border-zinc-800 p-6 lg:border-b-0 lg:border-r">
            <h3 className="mb-4 text-sm font-semibold text-white">Configure Your Workload</h3>
            
            <div className="space-y-6">
              {/* Compute Instances */}
              <div>
                <label className="mb-2 flex items-center justify-between text-sm text-zinc-300">
                  <span>Compute Instances</span>
                  <span className="font-mono text-green-400">{customScenario.computeInstances}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={customScenario.computeInstances}
                  onChange={(e) => setCustomScenario({ computeInstances: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-zinc-500">8 vCPU, 16GB RAM each</p>
              </div>
              
              {/* Storage */}
              <div>
                <label className="mb-2 flex items-center justify-between text-sm text-zinc-300">
                  <span>Block Storage</span>
                  <span className="font-mono text-green-400">{customScenario.storageTb} TB</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={customScenario.storageTb}
                  onChange={(e) => setCustomScenario({ storageTb: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-zinc-500">SSD block storage</p>
              </div>
              
              {/* Data Transfer */}
              <div>
                <label className="mb-2 flex items-center justify-between text-sm text-zinc-300">
                  <span>Data Transfer (Egress)</span>
                  <span className="font-mono text-green-400">{customScenario.dataTransferTb} TB</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={customScenario.dataTransferTb}
                  onChange={(e) => setCustomScenario({ dataTransferTb: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-zinc-500">Outbound data transfer</p>
              </div>
              
              {/* Database */}
              <div>
                <label className="mb-2 flex items-center justify-between text-sm text-zinc-300">
                  <span>Database Instances</span>
                  <span className="font-mono text-green-400">{customScenario.databaseInstances}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={customScenario.databaseInstances}
                  onChange={(e) => setCustomScenario({ databaseInstances: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-zinc-500">4 vCPU, 16GB RAM each</p>
              </div>
              
              <button
                onClick={resetScenario}
                className="w-full rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                Reset to Baseline
              </button>
            </div>
          </div>
          
          {/* Results */}
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Estimated Costs</h3>
              {cheapest && (
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <TrendingDown className="h-3 w-3" />
                  <span>Best: {cheapest.displayName}</span>
                </div>
              )}
            </div>
            
            <div className="max-h-[500px] space-y-2 overflow-y-auto pr-2">
              {estimates.map((estimate) => {
                const isMin = estimate.total === minCost;
                const relativePercent = isMin ? 0 : Math.round(((estimate.total - minCost) / minCost) * 100);
                
                return (
                  <div
                    key={estimate.datacenterId}
                    className={`rounded-lg border p-3 ${
                      isMin 
                        ? 'border-green-500/50 bg-green-500/5' 
                        : 'border-zinc-700 bg-zinc-800/30'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">{estimate.displayName}</div>
                        <div className="text-xs text-zinc-400">{estimate.provider}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{formatCurrency(estimate.total, false)}</div>
                        {!isMin && (
                          <div className="text-xs text-yellow-400">+{relativePercent}%</div>
                        )}
                        {isMin && (
                          <div className="text-xs text-green-400">Cheapest</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Compute:</span>
                        <span className="text-zinc-300">{formatCurrency(estimate.breakdown.compute)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Storage:</span>
                        <span className="text-zinc-300">{formatCurrency(estimate.breakdown.storage)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Transfer:</span>
                        <span className="text-zinc-300">{formatCurrency(estimate.breakdown.dataTransfer)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Database:</span>
                        <span className="text-zinc-300">{formatCurrency(estimate.breakdown.database)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 rounded-lg bg-zinc-800/50 p-3 text-xs text-zinc-400">
              <strong>Note:</strong> Estimates based on on-demand pricing. Reserved instances and spot pricing can reduce costs by 30-70%.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
