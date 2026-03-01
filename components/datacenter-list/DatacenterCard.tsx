'use client';

import React from 'react';
import { Check, Zap } from 'lucide-react';
import { Datacenter } from '@/types/datacenter';
import { getProviderColor, PROVIDER_TYPE_LABELS } from '@/lib/utils/providerColors';
import { getDisplayColor } from '@/lib/utils/colorBrightness';
import { useComparisonStore } from '@/store/comparisonStore';
import { useLatencyStore } from '@/store/latencyStore';
import { PricingBadge } from '@/components/pricing/PricingBadge';
import { LatencyBadge } from '@/components/latency/LatencyBadge';

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

  const hasIssues = datacenter.powerStatus !== 'none' || datacenter.waterStatus !== 'none';

  return (
    <div className={`flex flex-col rounded-2xl overflow-hidden transition-all duration-200 border ${
      inComparison
        ? 'bg-[#BF5AF2]/[0.03] border-[#BF5AF2]/30'
        : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.05] hover:border-white/[0.15]'
    }`}>
      {/* Provider accent bar */}
      <div className="h-1 w-full flex-shrink-0" style={{ backgroundColor: displayColor }} />

      <div className="flex flex-col flex-1 p-4">
        {/* Provider row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: displayColor, boxShadow: `0 0 6px ${displayColor}60` }}
            />
            <span
              className="text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ backgroundColor: displayColor + '22', color: displayColor }}
            >
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
        <p className="text-sm font-bold text-white leading-snug mb-1">
          {datacenter.metadata?.displayName || datacenter.name}
        </p>
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <svg className="w-3 h-3 text-white/25 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{[datacenter.city, datacenter.state].filter(Boolean).join(', ')}</span>
            {datacenter.metadata?.region && (
              <span className="text-white/25">· {datacenter.metadata.region.replace(/-/g, ' ')}</span>
            )}
          </div>
          {datacenter.metadata?.address1 && (
            <p className="text-xs text-white/30 mt-0.5 pl-4">
              {datacenter.metadata.address1}
              {datacenter.metadata.address2 ? `, ${datacenter.metadata.address2}` : ''}
              {datacenter.metadata.zipcode ? ` ${datacenter.metadata.zipcode}` : ''}
            </p>
          )}
        </div>

        {/* Metrics grid */}
        {(datacenter.metadata?.capacityMW || datacenter.metadata?.pue || datacenter.metadata?.availabilityZones || datacenter.metadata?.renewable !== undefined) && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {datacenter.metadata?.capacityMW && (
              <div className="bg-white/[0.04] rounded-xl p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-0.5">Capacity</p>
                <p className="text-sm font-bold text-white tabular-nums">
                  {datacenter.metadata.capacityMW}<span className="text-xs text-white/35 ml-1 font-normal">MW</span>
                </p>
              </div>
            )}
            {datacenter.metadata?.pue && (
              <div className="bg-white/[0.04] rounded-xl p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-0.5">Efficiency</p>
                <p className={`text-sm font-bold tabular-nums ${getPueColor(datacenter.metadata.pue)}`}>
                  {datacenter.metadata.pue.toFixed(2)}<span className="text-xs text-white/35 ml-1 font-normal">PUE</span>
                </p>
              </div>
            )}
            {datacenter.metadata?.availabilityZones && (
              <div className="bg-white/[0.04] rounded-xl p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-0.5">Zones</p>
                <p className="text-sm font-bold text-[#BF5AF2] tabular-nums">
                  {datacenter.metadata.availabilityZones}<span className="text-xs text-white/35 ml-1 font-normal">AZs</span>
                </p>
              </div>
            )}
            {datacenter.metadata?.renewable !== undefined && (
              <div className="bg-white/[0.04] rounded-xl p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-0.5">Energy</p>
                <p className={`text-sm font-bold ${datacenter.metadata.renewable ? 'text-[#00D084]' : 'text-white/35'}`}>
                  {datacenter.metadata.renewable ? '✓ Renewable' : 'Standard'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Connectivity (PeeringDB) */}
        {(datacenter.metadata?.netCount || datacenter.metadata?.ixCount || datacenter.metadata?.carrierCount) && (
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2">Connectivity</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/[0.04] rounded-xl p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-0.5">Networks</p>
                <p className="text-sm font-bold text-[#0066FF] tabular-nums">{datacenter.metadata.netCount ?? '—'}</p>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-0.5">Exchanges</p>
                <p className="text-sm font-bold text-[#BF5AF2] tabular-nums">{datacenter.metadata.ixCount ?? '—'}</p>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-0.5">Carriers</p>
                <p className="text-sm font-bold text-[#00D084] tabular-nums">{datacenter.metadata.carrierCount ?? '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing & Latency badges */}
        <div className="mb-3 space-y-2">
          <PricingBadge datacenterId={datacenter.id} variant="detailed" />
          <LatencyBadge datacenterId={datacenter.id} />
        </div>

        {/* Status */}
        {hasIssues ? (
          <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl p-2.5 mb-3">
            <p className="text-xs font-bold text-[#FF3B30] mb-1">Issues Reported</p>
            <div className="space-y-0.5">
              {datacenter.powerStatus !== 'none' && (
                <p className="text-xs text-white/60">⚡ Power: {datacenter.powerStatus}</p>
              )}
              {datacenter.waterStatus !== 'none' && (
                <p className="text-xs text-white/60">💧 Water: {datacenter.waterStatus}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#00D084]/10 border border-[#00D084]/20 rounded-xl p-2.5 mb-3 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-[#00D084] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold text-[#00D084]">All systems operational</span>
          </div>
        )}

        {/* Opened */}
        {datacenter.metadata?.opened && (
          <p className="text-xs text-white/35 mb-3">Opened {datacenter.metadata.opened}</p>
        )}

        {/* Certifications */}
        {datacenter.metadata?.certifications && datacenter.metadata.certifications.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5">Certifications</p>
            <div className="flex flex-wrap gap-1.5">
              {datacenter.metadata.certifications.map((cert, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-white/[0.06] border border-white/[0.08] text-white/50 rounded-lg">{cert}</span>
              ))}
            </div>
          </div>
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

        {/* External links */}
        {(datacenter.metadata?.statusDashboard || datacenter.metadata?.url || datacenter.metadata?.peeringDbId) && (
          <div className="flex gap-1.5 mt-2">
            {datacenter.metadata.statusDashboard && (
              <a
                href={datacenter.metadata.statusDashboard}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-8 flex items-center justify-center rounded-lg text-xs font-semibold bg-[#0066FF]/10 text-[#0066FF] hover:bg-[#0066FF]/20 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Status
              </a>
            )}
            {datacenter.metadata.url && (
              <a
                href={datacenter.metadata.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-8 flex items-center justify-center rounded-lg text-xs font-semibold bg-white/[0.05] text-white/50 hover:text-white hover:bg-white/[0.10] border border-white/[0.08] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Website
              </a>
            )}
            {datacenter.metadata.peeringDbId && (
              <a
                href={`https://www.peeringdb.com/fac/${datacenter.metadata.peeringDbId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-8 flex items-center justify-center rounded-lg text-xs font-semibold bg-white/[0.05] text-white/50 hover:text-white hover:bg-white/[0.10] border border-white/[0.08] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                PeeringDB ↗
              </a>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2.5 mt-2 border-t border-white/[0.06] text-[10px] text-white/25 space-y-1">
          {datacenter.verified && (
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-[#00D084]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Verified {datacenter.source}</span>
            </div>
          )}
          <div>Updated {new Date(datacenter.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
      </div>
    </div>
  );
}
