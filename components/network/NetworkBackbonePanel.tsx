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
    showBackbone, selectedProviders, selectedConnectionTypes, showLabels, animate, lineWidth, opacity,
    toggleBackbone, toggleProvider, toggleConnectionType, setShowLabels, setAnimate, setLineWidth, setOpacity, reset,
  } = useNetworkStore();

  const [expandedSection, setExpandedSection] = useState<string | null>('providers');
  const providerBackbones = getAllProviderBackbones();
  const stats = getNetworkStats();

  if (!isOpen) return null;

  const toggleSection = (section: string) => setExpandedSection(expandedSection === section ? null : section);

  const sectionBtn = 'flex w-full items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.08] transition-colors';
  const checkLabel = 'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white/[0.05]';

  return (
    <div className="fixed right-4 top-16 z-40 w-72 max-h-[calc(100vh-5rem)] flex flex-col glass rounded-2xl shadow-2xl animate-in slide-up duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-[#BF5AF2]" />
          <h3 className="text-sm font-bold text-white">Network Backbone</h3>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/35 hover:text-white hover:bg-white/[0.08] transition-all" aria-label="Close panel">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-y-auto scrollbar-hide p-4 space-y-3 flex-1">
        {/* Master toggle */}
        <button
          onClick={toggleBackbone}
          className={`w-full rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${
            showBackbone
              ? 'bg-[#0066FF] text-white'
              : 'bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.10]'
          }`}
        >
          {showBackbone ? '✓ Backbone Visible' : 'Show Backbone'}
        </button>

        {showBackbone && (
          <>
            {/* Stats */}
            <div className="bg-white/[0.04] rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Active Connections</p>
              <p className="text-2xl font-bold text-white tabular-nums">{stats.active}</p>
              <div className="flex gap-2 text-xs mt-2">
                <span className="text-white/35">Redundant:</span>
                <span className="text-[#00D084] font-semibold">{stats.redundancyRate}%</span>
              </div>
            </div>

            {/* Provider selection */}
            <div>
              <button onClick={() => toggleSection('providers')} className={sectionBtn}>
                <span>Providers ({selectedProviders.length || 'All'})</span>
                {expandedSection === 'providers' ? <ChevronUp className="h-3.5 w-3.5 text-white/35" /> : <ChevronDown className="h-3.5 w-3.5 text-white/35" />}
              </button>
              {expandedSection === 'providers' && (
                <div className="mt-1.5 space-y-0.5 bg-white/[0.02] rounded-xl p-2">
                  {providerBackbones.map((pb) => (
                    <label key={pb.provider} className={checkLabel}>
                      <input type="checkbox" checked={selectedProviders.includes(pb.provider)} onChange={() => toggleProvider(pb.provider)} className="w-4 h-4 rounded accent-[#0066FF]" />
                      <span className="flex-1 text-white/70">{pb.provider}</span>
                      <span className="text-xs text-white/25 tabular-nums">{stats.byProvider[pb.provider] || 0}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Connection types */}
            <div>
              <button onClick={() => toggleSection('types')} className={sectionBtn}>
                <span>Connection Types</span>
                {expandedSection === 'types' ? <ChevronUp className="h-3.5 w-3.5 text-white/35" /> : <ChevronDown className="h-3.5 w-3.5 text-white/35" />}
              </button>
              {expandedSection === 'types' && (
                <div className="mt-1.5 space-y-0.5 bg-white/[0.02] rounded-xl p-2">
                  {(['backbone', 'peering', 'transit', 'private-interconnect'] as const).map((type) => (
                    <label key={type} className={checkLabel}>
                      <input type="checkbox" checked={selectedConnectionTypes.includes(type)} onChange={() => toggleConnectionType(type)} className="w-4 h-4 rounded accent-[#0066FF]" />
                      <span className="flex-1 text-white/70 capitalize">{type.replace('-', ' ')}</span>
                      <span className="text-xs text-white/25 tabular-nums">{stats.byType[type] || 0}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Visual settings */}
            <div>
              <button onClick={() => toggleSection('visual')} className={sectionBtn}>
                <span>Visual Settings</span>
                {expandedSection === 'visual' ? <ChevronUp className="h-3.5 w-3.5 text-white/35" /> : <ChevronDown className="h-3.5 w-3.5 text-white/35" />}
              </button>
              {expandedSection === 'visual' && (
                <div className="mt-1.5 space-y-3 bg-white/[0.02] rounded-xl p-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-white/35 font-medium">Line Width</label>
                      <span className="text-xs font-mono text-white/60">{lineWidth}px</span>
                    </div>
                    <input type="range" min="1" max="5" step="0.5" value={lineWidth} onChange={(e) => setLineWidth(parseFloat(e.target.value))} className="w-full accent-[#0066FF]" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-white/35 font-medium">Opacity</label>
                      <span className="text-xs font-mono text-white/60">{Math.round(opacity * 100)}%</span>
                    </div>
                    <input type="range" min="0.2" max="1" step="0.1" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-[#0066FF]" />
                  </div>
                  <label className={checkLabel}>
                    <input type="checkbox" checked={animate} onChange={(e) => setAnimate(e.target.checked)} className="w-4 h-4 rounded accent-[#0066FF]" />
                    <span className="text-sm text-white/70">Animated Lines</span>
                  </label>
                  <label className={checkLabel}>
                    <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} className="w-4 h-4 rounded accent-[#0066FF]" />
                    <span className="text-sm text-white/70">Show Labels</span>
                  </label>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="bg-[#0066FF]/10 border border-[#0066FF]/15 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Info className="h-3 w-3 text-[#0066FF]/70" />
                <span className="text-xs font-bold text-[#0066FF]/80 uppercase tracking-wide">Connection Types</span>
              </div>
              <div className="space-y-1 text-xs text-white/40">
                <p>🔵 <span className="text-white/60 font-medium">Backbone</span> — Provider&apos;s primary network</p>
                <p>🟢 <span className="text-white/60 font-medium">Peering</span> — Direct interconnection</p>
                <p>🟠 <span className="text-white/60 font-medium">Transit</span> — Third-party routing</p>
                <p>🟣 <span className="text-white/60 font-medium">Private</span> — Dedicated links</p>
              </div>
            </div>

            <button onClick={reset} className="w-full rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/[0.05] transition-all">
              Reset to Defaults
            </button>
          </>
        )}
      </div>
    </div>
  );
}
