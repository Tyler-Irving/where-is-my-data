'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useFilterStore } from '@/store/filterStore';
import { useComparisonStore } from '@/store/comparisonStore';
import { useLatencyStore } from '@/store/latencyStore';
import { filterDatacenters } from '@/lib/utils/filterDatacenters';
import { getProviderColor } from '@/lib/utils/providerColors';
import { getDisplayColor } from '@/lib/utils/colorBrightness';
import { PricingBadge } from '@/components/pricing/PricingBadge';
import { LatencyBadge } from '@/components/latency/LatencyBadge';
import { Datacenter } from '@/types/datacenter';
import { ChevronDown, ChevronUp, Check, Zap, ExternalLink } from 'lucide-react';
import { COUNTRY_CONFIGS } from '@/store/mapStore';

type SortKey = 'name' | 'capacity' | 'pue';

function getPueColor(pue: number) {
  if (pue < 1.2) return 'text-[#00D084]';
  if (pue < 1.4) return 'text-[#FF9500]';
  return 'text-[#FF3B30]';
}

// --- Local card component (not exported) ---

interface MobileDatacenterCardProps {
  datacenter: Datacenter;
  isExpanded: boolean;
  onToggle: () => void;
}

function MobileDatacenterCard({ datacenter, isExpanded, onToggle }: MobileDatacenterCardProps) {
  const providerColor = getProviderColor(datacenter.provider);
  const displayColor = getDisplayColor(providerColor);
  const location = [datacenter.city, datacenter.state, datacenter.country !== 'US' ? datacenter.country : null]
    .filter(Boolean)
    .join(', ');

  const { selectedIds: comparisonIds, addToComparison, removeFromComparison } = useComparisonStore();
  const { selectedForLatency, addToLatency, removeFromLatency } = useLatencyStore();
  const isCompared = comparisonIds.includes(datacenter.id);
  const isLatency = selectedForLatency.includes(datacenter.id);

  return (
    <div className="border-b border-white/[0.04]">
      {/* Header row — always visible, tap to toggle */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-white/[0.03] transition-colors"
      >
        {/* Provider color accent bar */}
        <div className="w-[3px] self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: displayColor }} />

        {/* Name + location */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{datacenter.name}</p>
          {location && <p className="text-xs text-white/40 mt-0.5 truncate">{location}</p>}
        </div>

        {/* Key stats */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {datacenter.metadata?.capacityMW != null && (
            <span className="text-xs text-white/40 tabular-nums">{datacenter.metadata.capacityMW}MW</span>
          )}
          {datacenter.metadata?.pue != null && (
            <span className="text-xs text-white/40 tabular-nums">{datacenter.metadata.pue.toFixed(2)}</span>
          )}
          {datacenter.metadata?.renewable && (
            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          )}
        </div>

        {/* Chevron */}
        {isExpanded
          ? <ChevronUp className="w-4 h-4 text-white/25 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-white/25 flex-shrink-0" />
        }
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-5 space-y-4">
          {/* Address */}
          {datacenter.metadata?.address1 && (
            <p className="text-xs text-white/35">
              {[datacenter.metadata.address1, datacenter.metadata.address2, datacenter.metadata.zipcode]
                .filter(Boolean).join(', ')}
            </p>
          )}

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-2">
            {datacenter.metadata?.capacityMW != null && (
              <div className="bg-white/[0.04] rounded-xl p-3">
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Capacity</p>
                <p className="text-sm font-bold text-white mt-1">{datacenter.metadata.capacityMW} MW</p>
              </div>
            )}
            {datacenter.metadata?.pue != null && (
              <div className="bg-white/[0.04] rounded-xl p-3">
                <p className="text-[10px] text-white/30 uppercase tracking-widest">PUE</p>
                <p className={`text-sm font-bold mt-1 ${getPueColor(datacenter.metadata.pue)}`}>
                  {datacenter.metadata.pue.toFixed(2)}
                </p>
              </div>
            )}
            {datacenter.metadata?.availabilityZones != null && (
              <div className="bg-white/[0.04] rounded-xl p-3">
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Avail. Zones</p>
                <p className="text-sm font-bold text-white mt-1">{datacenter.metadata.availabilityZones}</p>
              </div>
            )}
            <div className="bg-white/[0.04] rounded-xl p-3">
              <p className="text-[10px] text-white/30 uppercase tracking-widest">Energy</p>
              <p className="text-sm font-bold mt-1" style={{ color: datacenter.metadata?.renewable ? '#34d399' : 'rgba(255,255,255,0.35)' }}>
                {datacenter.metadata?.renewable ? 'Renewable' : 'Standard'}
              </p>
            </div>
          </div>

          {/* PeeringDB connectivity */}
          {(datacenter.metadata?.netCount || datacenter.metadata?.ixCount || datacenter.metadata?.carrierCount) && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Connectivity</p>
              <div className="grid grid-cols-3 gap-2">
                {datacenter.metadata?.netCount != null && (
                  <div className="bg-white/[0.04] rounded-xl p-3 text-center">
                    <p className="text-sm font-bold text-white">{datacenter.metadata.netCount}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Networks</p>
                  </div>
                )}
                {datacenter.metadata?.ixCount != null && (
                  <div className="bg-white/[0.04] rounded-xl p-3 text-center">
                    <p className="text-sm font-bold text-white">{datacenter.metadata.ixCount}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Exchanges</p>
                  </div>
                )}
                {datacenter.metadata?.carrierCount != null && (
                  <div className="bg-white/[0.04] rounded-xl p-3 text-center">
                    <p className="text-sm font-bold text-white">{datacenter.metadata.carrierCount}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Carriers</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status */}
          {datacenter.powerStatus !== 'none' || datacenter.waterStatus !== 'none' ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
              <p className="text-xs text-amber-400">
                {datacenter.powerStatus !== 'none' && `Power: ${datacenter.powerStatus}`}
                {datacenter.powerStatus !== 'none' && datacenter.waterStatus !== 'none' && ' · '}
                {datacenter.waterStatus !== 'none' && `Water: ${datacenter.waterStatus}`}
              </p>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
              <p className="text-xs text-emerald-400">All systems operational</p>
            </div>
          )}

          {/* Opened + certifications */}
          {(datacenter.metadata?.opened || datacenter.metadata?.certifications?.length) ? (
            <div className="flex flex-wrap items-center gap-2">
              {datacenter.metadata?.opened && (
                <span className="text-xs text-white/30">Est. {datacenter.metadata.opened}</span>
              )}
              {datacenter.metadata?.certifications?.map(cert => (
                <span key={cert} className="text-[10px] bg-white/[0.06] text-white/45 px-2 py-0.5 rounded-full">
                  {cert}
                </span>
              ))}
            </div>
          ) : null}

          {/* Pricing + Latency badges */}
          <div className="flex flex-wrap gap-2">
            <PricingBadge datacenterId={datacenter.id} variant="detailed" />
            <LatencyBadge datacenterId={datacenter.id} />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (isCompared) {
                  removeFromComparison(datacenter.id);
                } else {
                  const result = addToComparison(datacenter.id);
                  if (!result.success && result.reason === 'limit') {
                    toast.warning('Maximum 3 datacenters can be compared.', {
                      description: 'Deselect one to add another.',
                      duration: 4000,
                    });
                  }
                }
              }}
              className={[
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors',
                isCompared
                  ? 'bg-[#0066FF]/20 text-[#0066FF] border border-[#0066FF]/30'
                  : 'bg-white/[0.06] text-white/60 hover:text-white',
              ].join(' ')}
            >
              <Check className="w-3.5 h-3.5" />
              {isCompared ? 'Comparing' : 'Compare'}
            </button>
            <button
              onClick={() => isLatency ? removeFromLatency(datacenter.id) : addToLatency(datacenter.id)}
              className={[
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-colors',
                isLatency
                  ? 'bg-[#FF9500]/20 text-[#FF9500] border border-[#FF9500]/30'
                  : 'bg-white/[0.06] text-white/60 hover:text-white',
              ].join(' ')}
            >
              <Zap className="w-3.5 h-3.5" />
              {isLatency ? 'In Latency' : 'Latency'}
            </button>
          </div>

          {/* External links */}
          {(datacenter.metadata?.statusDashboard || datacenter.metadata?.url || datacenter.metadata?.peeringDbId) && (
            <div className="flex flex-wrap gap-3">
              {datacenter.metadata?.statusDashboard && (
                <a
                  href={datacenter.metadata.statusDashboard}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Status
                </a>
              )}
              {datacenter.metadata?.url && (
                <a
                  href={datacenter.metadata.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Website
                </a>
              )}
              {datacenter.metadata?.peeringDbId && (
                <a
                  href={`https://www.peeringdb.com/fac/${datacenter.metadata.peeringDbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> PeeringDB
                </a>
              )}
            </div>
          )}

          {/* Footer: verification + last updated */}
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${datacenter.verified ? 'text-emerald-400' : 'text-white/25'}`}>
              {datacenter.verified ? 'Verified' : 'Unverified'}
            </span>
            <span className="text-[10px] text-white/20">Updated {datacenter.lastUpdated}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main exported component ---

export function MobileDatacenterList() {
  const { datacenters } = useDatacenterStore();
  const { providers, providerTypes, countries, capacityRange, pueRange, renewableOnly, setCountry } = useFilterStore();

  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Available countries — only those present in data and recognised in COUNTRY_CONFIGS
  const availableCountries = useMemo(() => {
    const seen = new Set<string>();
    datacenters.forEach(dc => seen.add(dc.country ?? 'US'));
    return Object.keys(COUNTRY_CONFIGS).filter(code => seen.has(code));
  }, [datacenters]);

  const activeCountryFilter = countries.size === 1 ? [...countries][0] : null;

  // Apply existing Zustand filter state
  const filtered = useMemo(
    () => filterDatacenters(datacenters, { providers, providerTypes, countries, capacityRange, pueRange, renewableOnly }),
    [datacenters, providers, providerTypes, countries, capacityRange, pueRange, renewableOnly]
  );

  // Sort within provider groups
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === 'capacity') return (b.metadata?.capacityMW ?? 0) - (a.metadata?.capacityMW ?? 0);
      if (sortKey === 'pue') return (a.metadata?.pue ?? 9) - (b.metadata?.pue ?? 9);
      return a.name.localeCompare(b.name);
    });
  }, [filtered, sortKey]);

  // Group by provider (alphabetical)
  const grouped = useMemo(() => {
    const map = new Map<string, Datacenter[]>();
    sorted.forEach(dc => {
      if (!map.has(dc.provider)) map.set(dc.provider, []);
      map.get(dc.provider)!.push(dc);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [sorted]);

  const handleToggle = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Sort bar */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/[0.06]">
        <div className="relative">
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="w-full bg-white/[0.06] text-white/70 text-xs rounded-xl pl-3 pr-8 py-2.5 border-0 outline-none appearance-none cursor-pointer"
          >
            <option value="name">Sort: Name</option>
            <option value="capacity">Sort: Capacity ↓</option>
            <option value="pue">Sort: PUE ↑</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
        </div>
      </div>

      {/* Country pills — only when multiple countries are in the data */}
      {availableCountries.length > 1 && (
        <div className="flex-shrink-0 px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-1.5">
          {availableCountries.map(code => {
            const config = COUNTRY_CONFIGS[code];
            const isActive = activeCountryFilter === code;
            return (
              <button
                key={code}
                onClick={() => setCountry(code)}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-150',
                  isActive
                    ? 'bg-[#0066FF] text-white'
                    : 'bg-white/[0.06] text-white/45 hover:text-white/70',
                ].join(' ')}
              >
                <span>{config.flag}</span>
                <span>{code}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Count bar */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-white/[0.04] flex items-center gap-1.5">
        <span className="text-[#0066FF] font-black text-sm tabular-nums">{sorted.length}</span>
        <span className="text-xs text-white/35">datacenters</span>
        {sorted.length < datacenters.length && (
          <span className="text-xs text-white/20">of {datacenters.length}</span>
        )}
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <p className="text-sm text-white/35">No datacenters match</p>
            <p className="text-xs text-white/20 mt-1">Try adjusting your filters</p>
          </div>
        ) : sortKey === 'name' ? (
          grouped.map(([provider, dcs]) => (
            <div key={provider}>
              {/* Sticky provider header */}
              <div className="sticky top-0 z-10 px-4 py-2 bg-black/95 backdrop-blur-sm border-b border-white/[0.04] flex items-center gap-2">
                <span className="text-xs font-bold text-white/55 uppercase tracking-widest">{provider}</span>
                <span className="text-xs text-white/20 tabular-nums">{dcs.length}</span>
              </div>
              {dcs.map(dc => (
                <MobileDatacenterCard
                  key={dc.id}
                  datacenter={dc}
                  isExpanded={expandedId === dc.id}
                  onToggle={() => handleToggle(dc.id)}
                />
              ))}
            </div>
          ))
        ) : (
          sorted.map(dc => (
            <MobileDatacenterCard
              key={dc.id}
              datacenter={dc}
              isExpanded={expandedId === dc.id}
              onToggle={() => handleToggle(dc.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
