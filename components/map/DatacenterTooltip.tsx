'use client';

import React from 'react';
import { Popup } from 'react-map-gl/mapbox';
import { Datacenter } from '@/types/datacenter';
import { getProviderColor, PROVIDER_TYPE_LABELS } from '@/lib/utils/providerColors';
import { useComparisonStore } from '@/store/comparisonStore';
import { useLatencyStore } from '@/store/latencyStore';
import { getDisplayColor } from '@/lib/utils/colorBrightness';
import { PricingBadge } from '@/components/pricing/PricingBadge';
import { LatencyBadge } from '@/components/latency/LatencyBadge';

interface DatacenterTooltipProps {
  datacenter: Datacenter;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const DatacenterTooltip = React.memo(function DatacenterTooltip({
  datacenter, onClose, onMouseEnter, onMouseLeave
}: DatacenterTooltipProps) {
  const displayColor = getDisplayColor(getProviderColor(datacenter.provider));
  const { addToComparison, removeFromComparison, isSelected } = useComparisonStore();
  const { selectedForLatency, addToLatency, removeFromLatency } = useLatencyStore();
  const inComparison = isSelected(datacenter.id);
  const inLatency = selectedForLatency.includes(datacenter.id);

  const metricCell = (label: string, value: React.ReactNode) => (
    <div className="bg-white/[0.04] rounded-xl p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">{label}</p>
      <div className="text-base font-bold text-white">{value}</div>
    </div>
  );

  return (
    <Popup
      latitude={datacenter.lat}
      longitude={datacenter.lng}
      onClose={onClose}
      closeButton={false}
      closeOnClick={false}
      offset={15}
      maxWidth="340px"
      className="datacenter-tooltip"
    >
      <div
        className="w-full text-white overflow-hidden rounded-2xl"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Provider accent bar */}
        <div className="h-1 w-full" style={{ backgroundColor: displayColor }} />

        <div className="p-4">
          {/* Header */}
          <div className="mb-3">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-bold text-base leading-tight text-white">{datacenter.name}</h3>
              <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: displayColor, boxShadow: `0 0 6px ${displayColor}` }} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: displayColor + '22', color: displayColor }}>
                {datacenter.provider}
              </span>
              {datacenter.metadata?.providerType && (
                <span className="text-xs text-white/35">{PROVIDER_TYPE_LABELS[datacenter.metadata.providerType]}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-white/50">
              <svg className="w-3 h-3 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{datacenter.city}, {datacenter.state}</span>
              {datacenter.metadata?.region && (
                <span className="text-white/25">· {datacenter.metadata.region.replace(/-/g, ' ')}</span>
              )}
            </div>
            {datacenter.metadata?.address1 && (
              <p className="text-xs text-white/30 mt-0.5 pl-4.5">
                {datacenter.metadata.address1}
                {datacenter.metadata.address2 ? `, ${datacenter.metadata.address2}` : ''}
                {datacenter.metadata.zipcode ? ` ${datacenter.metadata.zipcode}` : ''}
              </p>
            )}
          </div>

          {/* Metrics */}
          {(datacenter.metadata?.capacityMW || datacenter.metadata?.pue || datacenter.metadata?.availabilityZones || datacenter.metadata?.renewable !== undefined) && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {datacenter.metadata.capacityMW && metricCell('Capacity',
                <><span className="tabular-nums">{datacenter.metadata.capacityMW}</span><span className="text-xs text-white/35 ml-1 font-normal">MW</span></>
              )}
              {datacenter.metadata.pue && metricCell('Efficiency',
                <span className={`tabular-nums ${datacenter.metadata.pue < 1.2 ? 'text-[#00D084]' : datacenter.metadata.pue < 1.4 ? 'text-[#FF9500]' : 'text-[#FF3B30]'}`}>
                  {datacenter.metadata.pue.toFixed(2)}<span className="text-xs text-white/35 ml-1 font-normal">PUE</span>
                </span>
              )}
              {datacenter.metadata.availabilityZones && metricCell('Zones',
                <><span className="text-[#BF5AF2] tabular-nums">{datacenter.metadata.availabilityZones}</span><span className="text-xs text-white/35 ml-1 font-normal">AZs</span></>
              )}
              {datacenter.metadata.renewable !== undefined && metricCell('Energy',
                <span className={`text-sm ${datacenter.metadata.renewable ? 'text-[#00D084]' : 'text-white/35'}`}>
                  {datacenter.metadata.renewable ? '✓ Renewable' : 'Standard'}
                </span>
              )}
            </div>
          )}

          {/* Connectivity (PeeringDB) */}
          {(datacenter.metadata?.netCount || datacenter.metadata?.ixCount || datacenter.metadata?.carrierCount) && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2">Connectivity</p>
              <div className="grid grid-cols-3 gap-2">
                {metricCell('Networks', <span className="text-[#0066FF] tabular-nums">{datacenter.metadata.netCount ?? '—'}</span>)}
                {metricCell('Exchanges', <span className="text-[#BF5AF2] tabular-nums">{datacenter.metadata.ixCount ?? '—'}</span>)}
                {metricCell('Carriers', <span className="text-[#00D084] tabular-nums">{datacenter.metadata.carrierCount ?? '—'}</span>)}
              </div>
            </div>
          )}

          {/* Pricing & Latency badges */}
          <div className="mb-3 space-y-2">
            <PricingBadge datacenterId={datacenter.id} variant="detailed" />
            <LatencyBadge datacenterId={datacenter.id} />
          </div>

          {/* Status */}
          {(datacenter.powerStatus !== 'none' || datacenter.waterStatus !== 'none') ? (
            <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl p-2.5 mb-3">
              <p className="text-xs font-bold text-[#FF3B30] mb-1.5">Issues Reported</p>
              <div className="space-y-1">
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

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => inComparison ? removeFromComparison(datacenter.id) : addToComparison(datacenter.id)}
              className={`h-8 rounded-lg text-xs font-semibold transition-all duration-200 ${
                inComparison
                  ? 'bg-[#BF5AF2]/15 text-[#BF5AF2] border border-[#BF5AF2]/25'
                  : 'bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.10] border border-white/[0.08]'
              }`}
            >
              {inComparison ? '✓ Comparing' : 'Compare'}
            </button>
            <button
              onClick={() => inLatency ? removeFromLatency(datacenter.id) : addToLatency(datacenter.id)}
              className={`h-8 rounded-lg text-xs font-semibold transition-all duration-200 ${
                inLatency
                  ? 'bg-[#0066FF]/15 text-[#0066FF] border border-[#0066FF]/25'
                  : 'bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.10] border border-white/[0.08]'
              }`}
            >
              {inLatency ? '⚡ Selected' : 'Latency'}
            </button>
          </div>

          {/* External links */}
          {(datacenter.metadata?.statusDashboard || datacenter.metadata?.url || datacenter.metadata?.peeringDbId) && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {datacenter.metadata.statusDashboard && (
                <a href={datacenter.metadata.statusDashboard} target="_blank" rel="noopener noreferrer"
                  className="h-8 flex items-center justify-center rounded-lg text-xs font-semibold bg-[#0066FF]/10 text-[#0066FF] hover:bg-[#0066FF]/20 transition-colors"
                  onClick={(e) => e.stopPropagation()}>
                  Status
                </a>
              )}
              {datacenter.metadata.url && (
                <a href={datacenter.metadata.url} target="_blank" rel="noopener noreferrer"
                  className="h-8 flex items-center justify-center rounded-lg text-xs font-semibold bg-white/[0.05] text-white/50 hover:text-white hover:bg-white/[0.10] border border-white/[0.08] transition-colors"
                  onClick={(e) => e.stopPropagation()}>
                  Website
                </a>
              )}
              {datacenter.metadata.peeringDbId && (
                <a href={`https://www.peeringdb.com/fac/${datacenter.metadata.peeringDbId}`} target="_blank" rel="noopener noreferrer"
                  className="h-8 flex items-center justify-center rounded-lg text-xs font-semibold bg-white/[0.05] text-white/50 hover:text-white hover:bg-white/[0.10] border border-white/[0.08] transition-colors"
                  onClick={(e) => e.stopPropagation()}>
                  PeeringDB ↗
                </a>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-2.5 border-t border-white/[0.06] text-[10px] text-white/25 space-y-1">
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
    </Popup>
  );
});
