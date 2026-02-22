'use client';

import { useState } from 'react';
import { Network, X, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useNetworkStore } from '@/store/networkStore';
import { getAllProviderBackbones, getNetworkStats } from '@/lib/utils/network';

interface NetworkBackbonePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NetworkBackbonePanel({ isOpen, onClose }: NetworkBackbonePanelProps) {
  const {
    showBackbone,
    selectedProviders,
    selectedConnectionTypes,
    showLabels,
    animate,
    lineWidth,
    opacity,
    toggleBackbone,
    toggleProvider,
    toggleConnectionType,
    setShowLabels,
    setAnimate,
    setLineWidth,
    setOpacity,
    reset,
  } = useNetworkStore();
  
  const [expandedSection, setExpandedSection] = useState<string | null>('providers');
  
  const providerBackbones = getAllProviderBackbones();
  const stats = getNetworkStats();
  
  if (!isOpen) return null;
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  return (
    <div className="fixed right-4 top-20 z-40 w-80 max-h-[calc(100vh-6rem)] overflow-hidden rounded-xl bg-zinc-900 shadow-2xl border border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 p-4">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">Network Backbone</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-4">
        {/* Master Toggle */}
        <div className="mb-4">
          <button
            onClick={toggleBackbone}
            className={`w-full rounded-lg px-4 py-3 font-medium transition-colors ${
              showBackbone
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {showBackbone ? '✓ Backbone Visible' : 'Show Backbone'}
          </button>
        </div>
        
        {showBackbone && (
          <>
            {/* Stats Summary */}
            <div className="mb-4 rounded-lg bg-zinc-800/50 p-3">
              <div className="mb-2 text-xs font-medium text-zinc-400">Active Connections</div>
              <div className="text-2xl font-bold text-white">{stats.active}</div>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="text-zinc-400">Redundant:</span>
                <span className="text-green-400">{stats.redundancyRate}%</span>
              </div>
            </div>
            
            {/* Provider Selection */}
            <div className="mb-3">
              <button
                onClick={() => toggleSection('providers')}
                className="flex w-full items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                <span>Providers ({selectedProviders.length || 'All'})</span>
                {expandedSection === 'providers' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              
              {expandedSection === 'providers' && (
                <div className="mt-2 space-y-1 rounded-lg bg-zinc-800/30 p-2">
                  {providerBackbones.map((pb) => (
                    <label
                      key={pb.provider}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-zinc-700/50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProviders.includes(pb.provider)}
                        onChange={() => toggleProvider(pb.provider)}
                        className="rounded border-zinc-600"
                      />
                      <span className="flex-1 text-zinc-300">{pb.provider}</span>
                      <span className="text-xs text-zinc-500">
                        {stats.byProvider[pb.provider] || 0}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {/* Connection Types */}
            <div className="mb-3">
              <button
                onClick={() => toggleSection('types')}
                className="flex w-full items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                <span>Connection Types</span>
                {expandedSection === 'types' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              
              {expandedSection === 'types' && (
                <div className="mt-2 space-y-1 rounded-lg bg-zinc-800/30 p-2">
                  {(['backbone', 'peering', 'transit', 'private-interconnect'] as const).map((type) => (
                    <label
                      key={type}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-zinc-700/50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedConnectionTypes.includes(type)}
                        onChange={() => toggleConnectionType(type)}
                        className="rounded border-zinc-600"
                      />
                      <span className="flex-1 capitalize text-zinc-300">
                        {type.replace('-', ' ')}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {stats.byType[type] || 0}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {/* Visual Settings */}
            <div className="mb-3">
              <button
                onClick={() => toggleSection('visual')}
                className="flex w-full items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                <span>Visual Settings</span>
                {expandedSection === 'visual' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              
              {expandedSection === 'visual' && (
                <div className="mt-2 space-y-3 rounded-lg bg-zinc-800/30 p-3">
                  {/* Line Width */}
                  <div>
                    <label className="mb-1 flex items-center justify-between text-xs text-zinc-400">
                      <span>Line Width</span>
                      <span className="text-zinc-300">{lineWidth}px</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={lineWidth}
                      onChange={(e) => setLineWidth(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Opacity */}
                  <div>
                    <label className="mb-1 flex items-center justify-between text-xs text-zinc-400">
                      <span>Opacity</span>
                      <span className="text-zinc-300">{Math.round(opacity * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      min="0.2"
                      max="1"
                      step="0.1"
                      value={opacity}
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Toggles */}
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={animate}
                      onChange={(e) => setAnimate(e.target.checked)}
                      className="rounded border-zinc-600"
                    />
                    <span>Animated Lines</span>
                  </label>
                  
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={showLabels}
                      onChange={(e) => setShowLabels(e.target.checked)}
                      className="rounded border-zinc-600"
                    />
                    <span>Show Labels</span>
                  </label>
                </div>
              )}
            </div>
            
            {/* Info Panel */}
            <div className="rounded-lg bg-blue-500/10 p-3 text-xs text-blue-300">
              <div className="mb-1 flex items-center gap-1 font-medium">
                <Info className="h-3 w-3" />
                <span>Connection Types</span>
              </div>
              <div className="space-y-1 text-blue-300/80">
                <div>🔵 <strong>Backbone</strong>: Provider's primary network</div>
                <div>🟢 <strong>Peering</strong>: Direct interconnection</div>
                <div>🟠 <strong>Transit</strong>: Third-party routing</div>
                <div>🟣 <strong>Private</strong>: Dedicated links</div>
              </div>
            </div>
            
            {/* Reset Button */}
            <button
              onClick={reset}
              className="mt-3 w-full rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              Reset to Defaults
            </button>
          </>
        )}
      </div>
    </div>
  );
}
