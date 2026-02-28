'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useFilterStore } from '@/store/filterStore';
import { useDatacenterStore } from '@/store/datacenterStore';
import { getProviderColor, PROVIDER_TYPE_LABELS } from '@/lib/utils/providerColors';
import { getDisplayColor } from '@/lib/utils/colorBrightness';
import { ShareButton } from './ShareButton';
import { ExportButton } from './ExportButton';
import { ProviderType } from '@/types/datacenter';
import { useComparisonStore } from '@/store/comparisonStore';
import { filterDatacenters } from '@/lib/utils/filterDatacenters';

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ isOpen, onClose, children, align = 'left' }) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className={`absolute top-full ${align === 'left' ? 'left-0' : 'right-0'} mt-2 glass rounded-2xl z-50 min-w-[260px] max-h-[420px] overflow-y-auto shadow-2xl animate-in scale-in duration-200`}>
        {children}
      </div>
    </>
  );
};

const pillBase = 'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-200 whitespace-nowrap border cursor-pointer select-none touch-manipulation';
const pillActive = `${pillBase} bg-[#0066FF] border-[#0066FF] text-white`;
const pillInactive = `${pillBase} bg-white/[0.05] border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.10]`;

export const FilterBar = React.memo(function FilterBar() {
  const {
    providers, providerTypes, capacityRange, pueRange, renewableOnly,
    toggleProvider, toggleProviderType, setCapacityRange, setPueRange,
    setRenewableOnly, clearFilters, hasActiveFilters,
  } = useFilterStore();

  const datacenters = useDatacenterStore((state) => state.datacenters);
  const comparisonCount = useComparisonStore((state) => state.selectedIds.length);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const filteredDatacenters = useMemo(() => {
    return filterDatacenters(datacenters, { providers, providerTypes, capacityRange, pueRange, renewableOnly });
  }, [datacenters, providers, providerTypes, capacityRange, pueRange, renewableOnly]);

  const stats = useMemo(() => {
    const count = filteredDatacenters.length;
    const totalCapacity = filteredDatacenters.reduce((sum, dc) => sum + (dc.metadata?.capacityMW || 0), 0);
    const pueValues = filteredDatacenters.map(dc => dc.metadata?.pue).filter((p): p is number => p !== undefined);
    const avgPue = pueValues.length > 0 ? pueValues.reduce((s, p) => s + p, 0) / pueValues.length : null;
    const renewableCount = filteredDatacenters.filter(dc => dc.metadata?.renewable).length;
    const renewablePercent = count > 0 ? (renewableCount / count) * 100 : 0;
    const uniqueProviders = new Set(filteredDatacenters.map(dc => dc.provider)).size;
    const uniqueStates = new Set(filteredDatacenters.map(dc => dc.state)).size;
    return { count, totalCapacity, avgPue, renewablePercent, renewableCount, uniqueProviders, uniqueStates };
  }, [filteredDatacenters]);

  const availableProviders = useMemo(() => {
    const providerSet = new Set<string>();
    datacenters.forEach((dc) => {
      if (providerTypes.size > 0) {
        const dcType = dc.metadata?.providerType;
        if (dcType && providerTypes.has(dcType)) providerSet.add(dc.provider);
      } else {
        providerSet.add(dc.provider);
      }
    });
    return Array.from(providerSet).sort();
  }, [datacenters, providerTypes]);

  useEffect(() => {
    if (providers.size > 0) {
      const invalid = Array.from(providers).filter(p => !availableProviders.includes(p));
      if (invalid.length > 0) invalid.forEach(p => toggleProvider(p));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableProviders]);

  // Close mobile sheet on escape key
  useEffect(() => {
    if (!mobileSheetOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileSheetOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileSheetOpen]);

  const allProviderTypes: ProviderType[] = ['hyperscale-cloud', 'tech-giant', 'colocation', 'regional-cloud', 'edge-cdn'];

  const activeCount =
    providers.size + providerTypes.size +
    (capacityRange[0] !== 0 || capacityRange[1] !== 500 ? 1 : 0) +
    (pueRange[0] !== 1.0 || pueRange[1] !== 2.0 ? 1 : 0) +
    (renewableOnly ? 1 : 0);

  const statsGrid = (
    <div className="grid grid-cols-2 gap-2">
      {stats.totalCapacity > 0 && (
        <div className="bg-white/[0.04] rounded-xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Capacity</p>
          <p className="text-lg font-bold text-white tabular-nums">{stats.totalCapacity.toLocaleString()}<span className="text-xs text-white/35 ml-1 font-normal">MW</span></p>
        </div>
      )}
      {stats.avgPue !== null && (
        <div className="bg-white/[0.04] rounded-xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Avg PUE</p>
          <p className={`text-lg font-bold tabular-nums ${stats.avgPue < 1.2 ? 'text-[#00D084]' : stats.avgPue < 1.4 ? 'text-[#FF9500]' : 'text-[#FF3B30]'}`}>{stats.avgPue.toFixed(2)}</p>
        </div>
      )}
      <div className="bg-white/[0.04] rounded-xl p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Renewable</p>
        <p className="text-lg font-bold text-[#00D084] tabular-nums">{stats.renewablePercent.toFixed(0)}%</p>
      </div>
      <div className="bg-white/[0.04] rounded-xl p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Providers</p>
        <p className="text-lg font-bold text-[#BF5AF2] tabular-nums">{stats.uniqueProviders}</p>
      </div>
      <div className="bg-white/[0.04] rounded-xl p-3 col-span-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Coverage</p>
        <p className="text-lg font-bold text-[#0066FF] tabular-nums">{stats.uniqueStates} <span className="text-xs text-white/35 font-normal">states</span></p>
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky md:relative top-14 md:top-0 z-30 bg-black border-b border-white/[0.06]">

        {/* ─── Mobile bar ─── */}
        <div className="md:hidden flex items-center gap-2 px-4 py-2.5">
          {/* DC count */}
          <div className={`${pillInactive} pointer-events-none`}>
            <span className="text-[#0066FF] font-black text-sm tabular-nums">{stats.count}</span>
            <span>DCs</span>
          </div>

          <div className="flex-1" />

          <ExportButton />
          <ShareButton />

          {comparisonCount > 0 && (
            <div className={`${pillBase} bg-[#BF5AF2] border-[#BF5AF2] text-white`}>
              ⊕ {comparisonCount}
            </div>
          )}

          {/* Filter trigger */}
          <button
            onClick={() => setMobileSheetOpen(true)}
            className={activeCount > 0 ? pillActive : pillInactive}
            aria-label="Open filters"
          >
            <SlidersHorizontal className="w-3 h-3" />
            Filters
            {activeCount > 0 && (
              <span className="bg-white/25 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* ─── Desktop pill bar ─── */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide">

          {/* DC count / Stats */}
          <div className="relative flex-shrink-0">
            <button onClick={() => setOpenDropdown(openDropdown === 'stats' ? null : 'stats')} className={`${pillInactive} gap-1`}>
              <span className="text-[#0066FF] font-black text-sm tabular-nums">{stats.count}</span>
              <span>DCs</span>
            </button>
            <FilterDropdown isOpen={openDropdown === 'stats'} onClose={() => setOpenDropdown(null)}>
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Overview</p>
                {statsGrid}
              </div>
            </FilterDropdown>
          </div>

          {/* Provider Type */}
          <div className="relative flex-shrink-0">
            <button onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')} className={providerTypes.size > 0 ? pillActive : pillInactive}>
              Type
              {providerTypes.size > 0 && <span className="bg-white/25 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black">{providerTypes.size}</span>}
            </button>
            <FilterDropdown isOpen={openDropdown === 'type'} onClose={() => setOpenDropdown(null)}>
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2 px-2">Provider Type</p>
                {allProviderTypes.map((type) => (
                  <label key={type} className="flex items-center gap-2.5 cursor-pointer px-2 py-2 rounded-lg hover:bg-white/[0.05] transition-colors">
                    <input type="checkbox" checked={providerTypes.has(type)} onChange={() => toggleProviderType(type)} className="w-4 h-4 rounded accent-[#0066FF]" />
                    <span className="text-sm text-white/70">{PROVIDER_TYPE_LABELS[type]}</span>
                  </label>
                ))}
              </div>
            </FilterDropdown>
          </div>

          {/* Provider */}
          <div className="relative flex-shrink-0">
            <button onClick={() => setOpenDropdown(openDropdown === 'provider' ? null : 'provider')} className={providers.size > 0 ? pillActive : pillInactive}>
              Provider
              {providers.size > 0 && <span className="bg-white/25 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black">{providers.size}</span>}
            </button>
            <FilterDropdown isOpen={openDropdown === 'provider'} onClose={() => setOpenDropdown(null)}>
              <div className="p-3 max-h-[340px] overflow-y-auto scrollbar-hide">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2 px-2">Provider</p>
                {providerTypes.size > 0 && (
                  <div className="mx-2 mb-2 px-2.5 py-2 bg-[#0066FF]/10 border border-[#0066FF]/20 rounded-lg text-xs text-[#0066FF]/80">
                    Filtered by selected types
                  </div>
                )}
                {availableProviders.length === 0 ? (
                  <p className="px-2 py-4 text-center text-sm text-white/35">No providers match</p>
                ) : availableProviders.map((provider) => {
                  const displayColor = getDisplayColor(getProviderColor(provider));
                  return (
                    <label key={provider} className="flex items-center gap-2.5 cursor-pointer px-2 py-2 rounded-lg hover:bg-white/[0.05] transition-colors">
                      <input type="checkbox" checked={providers.has(provider)} onChange={() => toggleProvider(provider)} className="w-4 h-4 rounded accent-[#0066FF]" />
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: displayColor, boxShadow: `0 0 5px ${displayColor}` }} />
                      <span className="text-sm text-white/70">{provider}</span>
                    </label>
                  );
                })}
              </div>
            </FilterDropdown>
          </div>

          {/* Capacity */}
          <div className="relative flex-shrink-0">
            <button onClick={() => setOpenDropdown(openDropdown === 'capacity' ? null : 'capacity')} className={(capacityRange[0] !== 0 || capacityRange[1] !== 500) ? pillActive : pillInactive}>
              Capacity
              {(capacityRange[0] !== 0 || capacityRange[1] !== 500) && <span className="font-normal normal-case tracking-normal text-[10px]">{capacityRange[0]}–{capacityRange[1] === 500 ? '500+' : capacityRange[1]}MW</span>}
            </button>
            <FilterDropdown isOpen={openDropdown === 'capacity'} onClose={() => setOpenDropdown(null)}>
              <div className="p-4 w-[280px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Capacity (MW)</p>
                <div className="bg-white/[0.04] rounded-xl px-3 py-2 mb-4 text-center">
                  <span className="text-xl font-bold text-white tabular-nums">{capacityRange[0]}</span>
                  <span className="text-white/35 mx-2 text-sm">–</span>
                  <span className="text-xl font-bold text-white tabular-nums">{capacityRange[1] === 500 ? '500+' : capacityRange[1]}</span>
                  <span className="text-xs text-white/35 ml-1">MW</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/35 mb-1.5 block">Min</label>
                    <input type="range" min="0" max="500" step="10" value={capacityRange[0]} onChange={(e) => setCapacityRange([Number(e.target.value), capacityRange[1]])} className="w-full accent-[#0066FF]" />
                  </div>
                  <div>
                    <label className="text-xs text-white/35 mb-1.5 block">Max</label>
                    <input type="range" min="0" max="500" step="10" value={capacityRange[1]} onChange={(e) => setCapacityRange([capacityRange[0], Number(e.target.value)])} className="w-full accent-[#0066FF]" />
                  </div>
                </div>
              </div>
            </FilterDropdown>
          </div>

          {/* PUE */}
          <div className="relative flex-shrink-0">
            <button onClick={() => setOpenDropdown(openDropdown === 'pue' ? null : 'pue')} className={(pueRange[0] !== 1.0 || pueRange[1] !== 2.0) ? pillActive : pillInactive}>
              PUE
              {(pueRange[0] !== 1.0 || pueRange[1] !== 2.0) && <span className="font-normal normal-case tracking-normal text-[10px]">{pueRange[0].toFixed(1)}–{pueRange[1].toFixed(1)}</span>}
            </button>
            <FilterDropdown isOpen={openDropdown === 'pue'} onClose={() => setOpenDropdown(null)}>
              <div className="p-4 w-[280px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">PUE</p>
                <p className="text-xs text-white/35 mb-3">Lower = more efficient</p>
                <div className="bg-white/[0.04] rounded-xl px-3 py-2 mb-4 text-center">
                  <span className="text-xl font-bold text-white tabular-nums">{pueRange[0].toFixed(1)}</span>
                  <span className="text-white/35 mx-2 text-sm">–</span>
                  <span className="text-xl font-bold text-white tabular-nums">{pueRange[1].toFixed(1)}</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/35 mb-1.5 block">Min</label>
                    <input type="range" min="1.0" max="2.0" step="0.1" value={pueRange[0]} onChange={(e) => setPueRange([Number(e.target.value), pueRange[1]])} className="w-full accent-[#0066FF]" />
                  </div>
                  <div>
                    <label className="text-xs text-white/35 mb-1.5 block">Max</label>
                    <input type="range" min="1.0" max="2.0" step="0.1" value={pueRange[1]} onChange={(e) => setPueRange([pueRange[0], Number(e.target.value)])} className="w-full accent-[#0066FF]" />
                  </div>
                </div>
              </div>
            </FilterDropdown>
          </div>

          {/* Renewable */}
          <label className={renewableOnly ? `${pillActive} cursor-pointer` : `${pillInactive} cursor-pointer`}>
            <input type="checkbox" checked={renewableOnly} onChange={(e) => setRenewableOnly(e.target.checked)} className="sr-only" />
            <span>♻</span>
            <span>Renewable</span>
          </label>

          <div className="flex-shrink-0 w-px h-4 bg-white/[0.08] mx-1" />
          <div className="flex-shrink-0"><ExportButton /></div>
          <div className="flex-shrink-0"><ShareButton /></div>

          {comparisonCount > 0 && (
            <div className={`${pillBase} bg-[#BF5AF2] border-[#BF5AF2] text-white flex-shrink-0`}>
              ⊕ {comparisonCount}
              <span className="hidden sm:inline"> Selected</span>
            </div>
          )}

          {hasActiveFilters() && (
            <button onClick={clearFilters} className={`${pillInactive} flex-shrink-0`}>
              Clear ({activeCount})
            </button>
          )}
        </div>
      </div>

      {/* ─── Mobile Filter Sheet ─── */}
      {mobileSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileSheetOpen(false)}
          />

          {/* Sheet */}
          <div className="relative w-full max-h-[85vh] bg-[#0a0a0a] border border-white/[0.10] rounded-t-2xl overflow-hidden flex flex-col animate-in slide-up duration-300 shadow-2xl">

            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-white/[0.15] rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-white">Filters</h2>
                {activeCount > 0 && (
                  <p className="text-xs text-white/35">{activeCount} active · {stats.count} DCs shown</p>
                )}
                {activeCount === 0 && (
                  <p className="text-xs text-white/35">{stats.count} DCs shown</p>
                )}
              </div>
              <button
                onClick={() => setMobileSheetOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/35 hover:text-white hover:bg-white/[0.08] transition-all"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto scrollbar-hide flex-1 p-5 space-y-6">

              {/* Overview stats */}
              <section>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Overview</p>
                {statsGrid}
              </section>

              {/* Divider */}
              <div className="h-px bg-white/[0.06]" />

              {/* Provider Type */}
              <section>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Provider Type</p>
                <div className="space-y-0.5">
                  {allProviderTypes.map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer px-3 py-3 rounded-xl hover:bg-white/[0.05] transition-colors">
                      <input type="checkbox" checked={providerTypes.has(type)} onChange={() => toggleProviderType(type)} className="w-4 h-4 rounded accent-[#0066FF]" />
                      <span className="text-sm text-white/70">{PROVIDER_TYPE_LABELS[type]}</span>
                      {providerTypes.has(type) && <span className="ml-auto text-[#0066FF]">✓</span>}
                    </label>
                  ))}
                </div>
              </section>

              {/* Provider */}
              <section>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Provider</p>
                {providerTypes.size > 0 && (
                  <div className="mb-3 px-3 py-2 bg-[#0066FF]/10 border border-[#0066FF]/20 rounded-xl text-xs text-[#0066FF]/80">
                    Filtered by selected types
                  </div>
                )}
                <div className="space-y-0.5">
                  {availableProviders.length === 0 ? (
                    <p className="px-3 py-4 text-center text-sm text-white/35">No providers match</p>
                  ) : availableProviders.map((provider) => {
                    const displayColor = getDisplayColor(getProviderColor(provider));
                    return (
                      <label key={provider} className="flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-xl hover:bg-white/[0.05] transition-colors">
                        <input type="checkbox" checked={providers.has(provider)} onChange={() => toggleProvider(provider)} className="w-4 h-4 rounded accent-[#0066FF]" />
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: displayColor, boxShadow: `0 0 5px ${displayColor}` }} />
                        <span className="text-sm text-white/70">{provider}</span>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* Capacity */}
              <section>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Capacity (MW)</p>
                <div className="bg-white/[0.04] rounded-xl px-4 py-3 mb-4 text-center">
                  <span className="text-2xl font-bold text-white tabular-nums">{capacityRange[0]}</span>
                  <span className="text-white/35 mx-3 text-sm">–</span>
                  <span className="text-2xl font-bold text-white tabular-nums">{capacityRange[1] === 500 ? '500+' : capacityRange[1]}</span>
                  <span className="text-xs text-white/35 ml-1.5">MW</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/35 mb-2 block">Min</label>
                    <input type="range" min="0" max="500" step="10" value={capacityRange[0]} onChange={(e) => setCapacityRange([Number(e.target.value), capacityRange[1]])} className="w-full accent-[#0066FF]" />
                  </div>
                  <div>
                    <label className="text-xs text-white/35 mb-2 block">Max</label>
                    <input type="range" min="0" max="500" step="10" value={capacityRange[1]} onChange={(e) => setCapacityRange([capacityRange[0], Number(e.target.value)])} className="w-full accent-[#0066FF]" />
                  </div>
                </div>
              </section>

              {/* PUE */}
              <section>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">PUE</p>
                <p className="text-xs text-white/35 mb-3">Lower = more efficient</p>
                <div className="bg-white/[0.04] rounded-xl px-4 py-3 mb-4 text-center">
                  <span className="text-2xl font-bold text-white tabular-nums">{pueRange[0].toFixed(1)}</span>
                  <span className="text-white/35 mx-3 text-sm">–</span>
                  <span className="text-2xl font-bold text-white tabular-nums">{pueRange[1].toFixed(1)}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/35 mb-2 block">Min</label>
                    <input type="range" min="1.0" max="2.0" step="0.1" value={pueRange[0]} onChange={(e) => setPueRange([Number(e.target.value), pueRange[1]])} className="w-full accent-[#0066FF]" />
                  </div>
                  <div>
                    <label className="text-xs text-white/35 mb-2 block">Max</label>
                    <input type="range" min="1.0" max="2.0" step="0.1" value={pueRange[1]} onChange={(e) => setPueRange([pueRange[0], Number(e.target.value)])} className="w-full accent-[#0066FF]" />
                  </div>
                </div>
              </section>

              {/* Renewable */}
              <section>
                <label className="flex items-center justify-between cursor-pointer px-3 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">♻</span>
                    <div>
                      <p className="text-sm font-semibold text-white">Renewable Only</p>
                      <p className="text-xs text-white/35">{stats.renewableCount} datacenters</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={renewableOnly}
                    onChange={(e) => setRenewableOnly(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#00D084]"
                  />
                </label>
              </section>

            </div>

            {/* Footer actions */}
            <div className="flex gap-3 px-5 py-4 border-t border-white/[0.06] flex-shrink-0 pb-safe">
              {hasActiveFilters() ? (
                <button
                  onClick={clearFilters}
                  className="flex-1 py-3 rounded-xl border border-white/[0.08] text-sm font-semibold text-white/50 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  Clear All ({activeCount})
                </button>
              ) : (
                <div className="flex-1" />
              )}
              <button
                onClick={() => setMobileSheetOpen(false)}
                className="flex-1 py-3 bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
