'use client';

import React, { useState } from 'react';
import { Calculator, Zap, Network, Search, X } from 'lucide-react';
import { DatabaseLocationIcon } from '@/components/icons/DatabaseLocationIcon';
import { SearchBar } from '@/components/map/SearchBar';
import { AboutModal } from '@/components/modals/AboutModal';
import { KeyboardShortcutsModal } from '@/components/modals/KeyboardShortcutsModal';
import { CostCalculator } from '@/components/pricing/CostCalculator';
import { LatencyCalculator } from '@/components/latency/LatencyCalculator';
import { NetworkBackbonePanel } from '@/components/network/NetworkBackbonePanel';

export function Header() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showLatencyCalculator, setShowLatencyCalculator] = useState(false);
  const [showNetworkPanel, setShowNetworkPanel] = useState(false);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const iconBtn = (color: string) =>
    `w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.06] ${color}`;

  return (
    <>
      {/* ─── Main Header ─── */}
      <header className="h-14 bg-black border-b border-white/[0.06] px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">

        {/* Left: Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <DatabaseLocationIcon className="w-5 h-5 text-[#0066FF]" />
          <span className="text-sm font-black tracking-wider text-white uppercase hidden sm:block">
            Where is my data
          </span>
          <span className="text-sm font-black tracking-wider text-white uppercase sm:hidden">
            WIMD
          </span>
        </div>

        {/* Center: Search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-sm mx-8">
          <SearchBar />
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Mobile search toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className={`md:hidden ${iconBtn('text-white/60 hover:text-white')}`}
            aria-label="Search"
          >
            {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowLatencyCalculator(true)}
            className={iconBtn('text-[#0066FF] hover:text-white')}
            aria-label="Latency calculator"
            title="Latency calculator"
          >
            <Zap className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowNetworkPanel(true)}
            className={iconBtn('text-[#BF5AF2] hover:text-white')}
            aria-label="Network backbone"
            title="Network backbone"
          >
            <Network className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowCalculator(true)}
            className={iconBtn('text-[#00D084] hover:text-white')}
            aria-label="Cost calculator"
            title="Cost calculator"
          >
            <Calculator className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAbout(true)}
            className={iconBtn('text-white/35 hover:text-white')}
            aria-label="About"
            title="About this project"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button
            onClick={() => setShowShortcuts(true)}
            className={`hidden md:flex ${iconBtn('text-white/35 hover:text-white')}`}
            title="Keyboard shortcuts"
            aria-label="Keyboard shortcuts"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        </div>
      </header>

      {/* ─── Mobile Search Dropdown ─── */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-black border-b border-white/[0.06] px-4 py-3 sticky top-14 z-40">
          <SearchBar onResultSelected={() => setMobileSearchOpen(false)} />
        </div>
      )}

      {/* ─── Modals & Panels ─── */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <CostCalculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
      <LatencyCalculator isOpen={showLatencyCalculator} onClose={() => setShowLatencyCalculator(false)} />
      <NetworkBackbonePanel isOpen={showNetworkPanel} onClose={() => setShowNetworkPanel(false)} />
    </>
  );
}
