'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      {/* Dropdown content */}
      <div className={`absolute top-full ${align === 'left' ? 'left-0' : 'right-0'} mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 min-w-[280px] max-h-[400px] overflow-y-auto`}>
        {children}
      </div>
    </>
  );
};

export const FilterBar = React.memo(function FilterBar() {
  const {
    providers,
    providerTypes,
    capacityRange,
    pueRange,
    renewableOnly,
    toggleProvider,
    toggleProviderType,
    setCapacityRange,
    setPueRange,
    setRenewableOnly,
    clearFilters,
    hasActiveFilters,
  } = useFilterStore();
  
  const datacenters = useDatacenterStore((state) => state.datacenters);
  const comparisonCount = useComparisonStore((state) => state.selectedIds.length);
  
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Filter datacenters for stats
  const filteredDatacenters = useMemo(() => {
    return filterDatacenters(datacenters, { providers, providerTypes, capacityRange, pueRange, renewableOnly });
  }, [datacenters, providers, providerTypes, capacityRange, pueRange, renewableOnly]);
  
  // Calculate statistics
  const stats = useMemo(() => {
    const count = filteredDatacenters.length;
    const totalCapacity = filteredDatacenters.reduce((sum, dc) => sum + (dc.metadata?.capacityMW || 0), 0);
    const pueValues = filteredDatacenters.map(dc => dc.metadata?.pue).filter((pue): pue is number => pue !== undefined);
    const avgPue = pueValues.length > 0 ? pueValues.reduce((sum, pue) => sum + pue, 0) / pueValues.length : null;
    const renewableCount = filteredDatacenters.filter(dc => dc.metadata?.renewable).length;
    const renewablePercent = count > 0 ? (renewableCount / count) * 100 : 0;
    const uniqueProviders = new Set(filteredDatacenters.map(dc => dc.provider)).size;
    const uniqueStates = new Set(filteredDatacenters.map(dc => dc.state)).size;
    
    return { count, totalCapacity, avgPue, renewablePercent, renewableCount, uniqueProviders, uniqueStates };
  }, [filteredDatacenters]);
  
  // Extract unique providers from datacenters, filtered by selected provider types
  const availableProviders = useMemo(() => {
    const providerSet = new Set<string>();
    datacenters.forEach((dc) => {
      // If provider types are selected, only include providers that match
      if (providerTypes.size > 0) {
        const dcType = dc.metadata?.providerType;
        if (dcType && providerTypes.has(dcType)) {
          providerSet.add(dc.provider);
        }
      } else {
        // No provider type filter, show all providers
        providerSet.add(dc.provider);
      }
    });
    return Array.from(providerSet).sort();
  }, [datacenters, providerTypes]);
  
  // Clear invalid providers when provider types change
  useEffect(() => {
    if (providers.size > 0) {
      // Check if any selected providers are no longer available
      const invalidProviders = Array.from(providers).filter(
        provider => !availableProviders.includes(provider)
      );
      // Remove invalid providers
      if (invalidProviders.length > 0) {
        invalidProviders.forEach(provider => toggleProvider(provider));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableProviders]); // Only trigger when available providers change
  
  const allProviderTypes: ProviderType[] = [
    'hyperscale-cloud',
    'tech-giant',
    'colocation',
    'regional-cloud',
    'edge-cdn',
  ];
  
  // Count active filters
  const activeCount = 
    providers.size + 
    providerTypes.size + 
    (capacityRange[0] !== 0 || capacityRange[1] !== 500 ? 1 : 0) +
    (pueRange[0] !== 1.0 || pueRange[1] !== 2.0 ? 1 : 0) +
    (renewableOnly ? 1 : 0);
  
  return (
    <div className="sticky top-16 z-30 bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-3">
      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        {/* Filter label with count */}
        <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-400">
          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="font-medium whitespace-nowrap">
            <span className="hidden sm:inline">Filters </span>
            <span className="text-gray-500">({stats.count})</span>
          </span>
        </div>
        
        {/* Provider Type Filter */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all border whitespace-nowrap ${
              providerTypes.size > 0
                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="hidden sm:inline">Provider </span>Type
            {providerTypes.size > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {providerTypes.size}
              </span>
            )}
          </button>
          
          <FilterDropdown isOpen={openDropdown === 'type'} onClose={() => setOpenDropdown(null)}>
            <div className="p-3 space-y-2">
              {allProviderTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer group px-2 py-1.5 rounded hover:bg-gray-800">
                  <input
                    type="checkbox"
                    checked={providerTypes.has(type)}
                    onChange={() => toggleProviderType(type)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {PROVIDER_TYPE_LABELS[type]}
                  </span>
                </label>
              ))}
            </div>
          </FilterDropdown>
        </div>
        
        {/* Provider Filter */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'provider' ? null : 'provider')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all border whitespace-nowrap ${
              providers.size > 0
                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Provider
            {providers.size > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {providers.size}
              </span>
            )}
          </button>
          
          <FilterDropdown isOpen={openDropdown === 'provider'} onClose={() => setOpenDropdown(null)}>
            <div className="p-3 space-y-1 max-h-[360px] overflow-y-auto">
              {/* Info message when filtered by provider type */}
              {providerTypes.size > 0 && (
                <div className="px-2 py-1.5 mb-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
                  Showing providers from selected types only
                </div>
              )}
              
              {availableProviders.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-gray-400">
                  No providers match the selected type(s)
                </div>
              ) : (
                availableProviders.map((provider) => {
                  const color = getProviderColor(provider);
                  const displayColor = getDisplayColor(color);
                  return (
                    <label key={provider} className="flex items-center gap-2 cursor-pointer group px-2 py-1.5 rounded hover:bg-gray-800">
                      <input
                        type="checkbox"
                        checked={providers.has(provider)}
                        onChange={() => toggleProvider(provider)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                      />
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ 
                          backgroundColor: displayColor,
                          boxShadow: `0 0 4px ${displayColor}`
                        }}
                      />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {provider}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </FilterDropdown>
        </div>
        
        {/* Capacity Filter */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'capacity' ? null : 'capacity')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all border whitespace-nowrap ${
              capacityRange[0] !== 0 || capacityRange[1] !== 500
                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Capacity
            {(capacityRange[0] !== 0 || capacityRange[1] !== 500) && (
              <span className="ml-2 text-xs">
                {capacityRange[0]}-{capacityRange[1] === 500 ? '500+' : capacityRange[1]} MW
              </span>
            )}
          </button>
          
          <FilterDropdown isOpen={openDropdown === 'capacity'} onClose={() => setOpenDropdown(null)}>
            <div className="p-4 w-[320px]">
              <div className="text-sm font-medium text-white mb-3">
                Capacity (MW): {capacityRange[0]} - {capacityRange[1] === 500 ? '500+' : capacityRange[1]}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Minimum</label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={capacityRange[0]}
                    onChange={(e) => setCapacityRange([Number(e.target.value), capacityRange[1]])}
                    className="w-full accent-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Maximum</label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={capacityRange[1]}
                    onChange={(e) => setCapacityRange([capacityRange[0], Number(e.target.value)])}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            </div>
          </FilterDropdown>
        </div>
        
        {/* PUE Filter */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'pue' ? null : 'pue')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all border whitespace-nowrap ${
              pueRange[0] !== 1.0 || pueRange[1] !== 2.0
                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            PUE
            {(pueRange[0] !== 1.0 || pueRange[1] !== 2.0) && (
              <span className="ml-2 text-xs">
                {pueRange[0].toFixed(1)}-{pueRange[1].toFixed(1)}
              </span>
            )}
          </button>
          
          <FilterDropdown isOpen={openDropdown === 'pue'} onClose={() => setOpenDropdown(null)}>
            <div className="p-4 w-[320px]">
              <div className="text-sm font-medium text-white mb-3">
                PUE: {pueRange[0].toFixed(1)} - {pueRange[1].toFixed(1)}
              </div>
              <div className="text-xs text-gray-400 mb-4">
                Lower is better (more efficient)
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Minimum</label>
                  <input
                    type="range"
                    min="1.0"
                    max="2.0"
                    step="0.1"
                    value={pueRange[0]}
                    onChange={(e) => setPueRange([Number(e.target.value), pueRange[1]])}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Maximum</label>
                  <input
                    type="range"
                    min="1.0"
                    max="2.0"
                    step="0.1"
                    value={pueRange[1]}
                    onChange={(e) => setPueRange([pueRange[0], Number(e.target.value)])}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>
          </FilterDropdown>
        </div>
        
        {/* Renewable Toggle */}
        <label className="flex items-center gap-1.5 md:gap-2 cursor-pointer group px-3 md:px-4 py-1.5 md:py-2 rounded-lg border transition-all bg-gray-800 border-gray-700 hover:bg-gray-700 whitespace-nowrap">
          <input
            type="checkbox"
            checked={renewableOnly}
            onChange={(e) => setRenewableOnly(e.target.checked)}
            className="w-3.5 h-3.5 md:w-4 md:h-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500 focus:ring-offset-gray-900"
          />
          <span className={`text-xs md:text-sm font-medium transition-colors ${
            renewableOnly ? 'text-green-400' : 'text-gray-300 group-hover:text-white'
          }`}>
            <span className="hidden sm:inline">Renewable</span>
            <span className="sm:hidden">♻️</span>
          </span>
        </label>
        
        {/* Clear Filters */}
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-all whitespace-nowrap"
          >
            <span className="hidden sm:inline">Clear All ({activeCount})</span>
            <span className="sm:hidden">Clear ({activeCount})</span>
          </button>
        )}
        
        {/* Export Button */}
        <ExportButton />
        
        {/* Share Button */}
        <ShareButton />
        
        {/* Comparison indicator */}
        {comparisonCount > 0 && (
          <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium bg-purple-500/20 border border-purple-500 text-purple-400 whitespace-nowrap">
            Comparing {comparisonCount}
          </div>
        )}
        
        {/* Stats Button */}
        <div className="relative ml-auto">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'stats' ? null : 'stats')}
            className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all border bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 flex items-center gap-1.5 md:gap-2 whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-semibold text-blue-400 text-sm md:text-base">{stats.count}</span>
            <span className="hidden md:inline">Stats</span>
          </button>
          
          <FilterDropdown isOpen={openDropdown === 'stats'} onClose={() => setOpenDropdown(null)} align="right">
            <div className="p-4 w-[360px]">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Total Capacity */}
                {stats.totalCapacity > 0 && (
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Total Capacity</div>
                    <div className="text-lg font-bold text-white">
                      {stats.totalCapacity.toLocaleString()}
                      <span className="text-xs text-gray-400 ml-1 font-normal">MW</span>
                    </div>
                  </div>
                )}
                
                {/* Average PUE */}
                {stats.avgPue !== null && (
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Avg Efficiency</div>
                    <div className={`text-lg font-bold ${
                      stats.avgPue < 1.2 ? 'text-green-400' : 
                      stats.avgPue < 1.4 ? 'text-yellow-400' : 
                      'text-orange-400'
                    }`}>
                      {stats.avgPue.toFixed(2)}
                      <span className="text-xs text-gray-400 ml-1 font-normal">PUE</span>
                    </div>
                  </div>
                )}
                
                {/* Renewable Energy */}
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Renewable</div>
                  <div className="text-lg font-bold text-green-400">
                    {stats.renewablePercent.toFixed(0)}%
                    <span className="text-xs text-gray-400 ml-1 font-normal">
                      ({stats.renewableCount})
                    </span>
                  </div>
                </div>
                
                {/* Unique Providers */}
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Providers</div>
                  <div className="text-lg font-bold text-purple-400">
                    {stats.uniqueProviders}
                    <span className="text-xs text-gray-400 ml-1 font-normal">unique</span>
                  </div>
                </div>
                
                {/* States Covered */}
                <div className="bg-gray-800/50 rounded-lg p-3 col-span-2">
                  <div className="text-xs text-gray-400 mb-1">Geographic Coverage</div>
                  <div className="text-lg font-bold text-cyan-400">
                    {stats.uniqueStates}
                    <span className="text-xs text-gray-400 ml-1 font-normal">states</span>
                  </div>
                </div>
              </div>
              
              {/* PUE Explanation */}
              {stats.avgPue !== null && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-gray-400">
                      <span className="font-semibold text-blue-400">PUE</span> (Power Usage Effectiveness): Lower is better. 1.0 is perfect efficiency.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FilterDropdown>
        </div>
      </div>
    </div>
  );
});
