'use client';

import React from 'react';
import { Check, Zap } from 'lucide-react';
import { Datacenter } from '@/types/datacenter';
import { getProviderColor, PROVIDER_TYPE_LABELS } from '@/lib/utils/providerColors';
import { getDisplayColor } from '@/lib/utils/colorBrightness';
import { useComparisonStore } from '@/store/comparisonStore';
import { useLatencyStore } from '@/store/latencyStore';

function getPueColor(pue: number): string {
  if (pue < 1.2) return 'text-[#00D084]';
  if (pue < 1.4) return 'text-[#FF9500]';
  return 'text-[#FF3B30]';
}

interface DatacenterCardProps {
  datacenter: Datacenter;
}

export function DatacenterCard({ datacenter }: DatacenterCardProps) {
  const { isSelected, addToComparison, removeFromComparison } = useComparisonStore();
  const { selectedForLatency, addToLatency, removeFromLatency } = useLatencyStore();

  const inComparison = isSelected(datacenter.id);
  const inLatency = selectedForLatency.includes(datacenter.id);

  const providerColor = getProviderColor(datacenter.provider);
  const displayColor = getDisplayColor(providerColor);

  const btnBase = 'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border';
  const btnInactive = `${btnBase} bg-white/[0.05] border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.08]`;
  const btnComparePurple = `${btnBase} bg-[#BF5AF2]/10 border-[#BF5AF2]/20 text-[#BF5AF2]`;
  const btnLatencyBlue = `${btnBase} bg-[#0066FF]/10 border-[#0066FF]/20 text-[#0066FF]`;

  return (
    <div className={`flex flex-col rounded-2xl p-4 transition-all duration-200 border ${
      inComparison
        ? 'bg-[#BF5AF2]/[0.03] border-[#BF5AF2]/30'
        : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.05] hover:border-white/[0.15]'
    }`}>
      {/* Provider row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: displayColor, boxShadow: `0 0 6px ${displayColor}60` }}
          />
          <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">
            {datacenter.provider}
          </span>
        </div>
        {datacenter.metadata?.providerType && (
          <span className="text-[10px] text-white/30 bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 rounded-full">
            {PROVIDER_TYPE_LABELS[datacenter.metadata.providerType]}
          </span>
        )}
      </div>

      {/* Name & location */}
      <p className="text-sm font-semibold text-white leading-snug mb-0.5">
        {datacenter.metadata?.displayName || datacenter.name}
      </p>
      <p className="text-xs text-white/40 mb-3">
        {[datacenter.city, datacenter.state].filter(Boolean).join(', ')}
      </p>

      {/* Metrics */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-1">
        {datacenter.metadata?.capacityMW && (
          <span className="text-white/55">{datacenter.metadata.capacityMW} MW</span>
        )}
        {datacenter.metadata?.pue && (
          <span className={getPueColor(datacenter.metadata.pue)}>
            PUE {datacenter.metadata.pue}
          </span>
        )}
        {datacenter.metadata?.availabilityZones && (
          <span className="text-white/40">{datacenter.metadata.availabilityZones} zones</span>
        )}
      </div>

      {datacenter.metadata?.renewable && (
        <p className="text-xs text-[#00D084] mb-3">✓ Renewable</p>
      )}

      {/* Actions */}
      <div className="flex gap-1.5 mt-auto pt-3">
        <button
          onClick={() => inComparison ? removeFromComparison(datacenter.id) : addToComparison(datacenter.id)}
          className={inComparison ? btnComparePurple : btnInactive}
          title={inComparison ? 'Remove from comparison' : 'Add to comparison'}
        >
          {inComparison && <Check className="w-3 h-3" />}
          {inComparison ? 'Comparing' : '+ Compare'}
        </button>
        <button
          onClick={() => inLatency ? removeFromLatency(datacenter.id) : addToLatency(datacenter.id)}
          className={inLatency ? btnLatencyBlue : btnInactive}
          title={inLatency ? 'Remove from latency' : 'Add to latency'}
        >
          <Zap className="w-3 h-3" />
          Latency
        </button>
      </div>
    </div>
  );
}
