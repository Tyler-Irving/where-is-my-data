'use client';

import React from 'react';
import { Popup } from 'react-map-gl/mapbox';
import { Datacenter } from '@/types/datacenter';
import { getProviderColor, PROVIDER_TYPE_LABELS } from '@/lib/utils/providerColors';
import { useComparisonStore } from '@/store/comparisonStore';
import { getAccentStyles, getDisplayColor } from '@/lib/utils/colorBrightness';

interface DatacenterTooltipProps {
  datacenter: Datacenter;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const DatacenterTooltip = React.memo(function DatacenterTooltip({ 
  datacenter, 
  onClose, 
  onMouseEnter, 
  onMouseLeave 
}: DatacenterTooltipProps) {
  const providerColor = getProviderColor(datacenter.provider);
  const displayColor = getDisplayColor(providerColor);
  const accentStyles = getAccentStyles(providerColor);
  const { addToComparison, removeFromComparison, isSelected } = useComparisonStore();
  
  const inComparison = isSelected(datacenter.id);
  
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
        className="w-full bg-zinc-900 text-white rounded-xl shadow-2xl border border-zinc-800 overflow-hidden"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Header with provider accent */}
        <div 
          className="h-1.5 w-full"
          style={accentStyles}
        />
        
        <div className="p-4">
          {/* Title Section */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-base leading-tight text-white">
                {datacenter.name}
              </h3>
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                style={{ 
                  backgroundColor: displayColor,
                  boxShadow: `0 0 4px ${displayColor}`
                }}
              />
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ 
                  backgroundColor: displayColor + '20',
                  color: displayColor 
                }}
              >
                {datacenter.provider}
              </span>
              {datacenter.metadata?.providerType && (
                <span className="text-xs text-zinc-400">
                  {PROVIDER_TYPE_LABELS[datacenter.metadata.providerType]}
                </span>
              )}
            </div>
            
            {/* Location */}
            <div className="flex items-center gap-1.5 mt-2 text-sm text-zinc-300">
              <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{datacenter.city}, {datacenter.state}</span>
            </div>
            
            {datacenter.metadata?.region && (
              <div className="text-xs text-zinc-500 ml-5 mt-0.5 capitalize">
                {datacenter.metadata.region.replace(/-/g, ' ')}
              </div>
            )}
          </div>

          {/* Key Metrics Grid */}
          {(datacenter.metadata?.capacityMW || datacenter.metadata?.pue || datacenter.metadata?.availabilityZones || datacenter.metadata?.renewable !== undefined) && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {datacenter.metadata.capacityMW && (
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-400 mb-1">Capacity</div>
                  <div className="text-lg font-semibold text-white">
                    {datacenter.metadata.capacityMW}
                    <span className="text-sm text-zinc-400 ml-1">MW</span>
                  </div>
                </div>
              )}
              
              {datacenter.metadata.pue && (
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-400 mb-1">Efficiency</div>
                  <div className={`text-lg font-semibold ${
                    datacenter.metadata.pue < 1.2 ? 'text-green-400' : 
                    datacenter.metadata.pue < 1.4 ? 'text-yellow-400' : 
                    'text-orange-400'
                  }`}>
                    {datacenter.metadata.pue.toFixed(2)}
                    <span className="text-sm text-zinc-400 ml-1">PUE</span>
                  </div>
                </div>
              )}
              
              {datacenter.metadata.availabilityZones && (
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-400 mb-1">Zones</div>
                  <div className="text-lg font-semibold text-purple-400">
                    {datacenter.metadata.availabilityZones}
                    <span className="text-sm text-zinc-400 ml-1">AZs</span>
                  </div>
                </div>
              )}
              
              {datacenter.metadata.renewable !== undefined && (
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-400 mb-1">Energy</div>
                  <div className={`text-sm font-medium ${
                    datacenter.metadata.renewable ? 'text-green-400' : 'text-zinc-500'
                  }`}>
                    {datacenter.metadata.renewable ? '✓ Renewable' : 'Standard'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Additional Info */}
          {datacenter.metadata?.opened && (
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Opened {datacenter.metadata.opened}</span>
            </div>
          )}

          {/* Certifications */}
          {datacenter.metadata?.certifications && datacenter.metadata.certifications.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-zinc-500 mb-1.5">Certifications</div>
              <div className="flex flex-wrap gap-1.5">
                {datacenter.metadata.certifications.map((cert, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status Indicators */}
          {(datacenter.powerStatus !== 'none' || datacenter.waterStatus !== 'none') ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
              <div className="text-xs font-medium text-red-400 mb-2">Issues Reported</div>
              <div className="space-y-1">
                {datacenter.powerStatus !== 'none' && (
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <span className="text-red-400">⚡</span>
                    <span>Power: {datacenter.powerStatus}</span>
                  </div>
                )}
                {datacenter.waterStatus !== 'none' && (
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <span className="text-red-400">💧</span>
                    <span>Water: {datacenter.waterStatus}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2.5 mb-3">
              <div className="flex items-center gap-2 text-xs text-green-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">All systems operational</span>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-3">
            <button
              onClick={() => {
                if (inComparison) {
                  removeFromComparison(datacenter.id);
                } else {
                  addToComparison(datacenter.id);
                }
              }}
              className={`w-full text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                inComparison
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              aria-label={inComparison ? `Remove ${datacenter.name} from comparison` : `Add ${datacenter.name} to comparison`}
              title={inComparison ? 'Remove from comparison' : 'Add to comparison'}
            >
              {inComparison ? '✓ Comparing' : 'Compare'}
            </button>
          </div>
          
          {/* Action Links */}
          {(datacenter.metadata?.statusDashboard || datacenter.metadata?.url) && (
            <div className="flex gap-2 mb-3">
              {datacenter.metadata.statusDashboard && (
                <a 
                  href={datacenter.metadata.statusDashboard}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-xs font-medium px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Status
                </a>
              )}
              {datacenter.metadata.url && (
                <a 
                  href={datacenter.metadata.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-xs font-medium px-3 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  Website
                </a>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-zinc-800 text-xs text-zinc-500 space-y-1">
            {datacenter.verified && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Verified {datacenter.source}</span>
              </div>
            )}
            {datacenter.metadata?.clli && (
              <div className="font-mono text-[10px]">
                CLLI: {datacenter.metadata.clli}
              </div>
            )}
            <div>
              Updated {new Date(datacenter.lastUpdated).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
});
