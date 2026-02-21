'use client';

import React, { useState } from 'react';
import { DatabaseLocationIcon } from '@/components/icons/DatabaseLocationIcon';
import { SearchBar } from '@/components/map/SearchBar';
import { AboutModal } from '@/components/modals/AboutModal';
import { KeyboardShortcutsModal } from '@/components/modals/KeyboardShortcutsModal';

export function Header() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Listen for ? key
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

  return (
    <>
      <header className="h-16 bg-gray-900 border-b border-gray-800 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 md:gap-3">
          <DatabaseLocationIcon className="w-6 h-6 text-blue-400" />
          <h1 className="text-lg font-semibold text-white whitespace-nowrap">Where is my data?</h1>
          <button
            onClick={() => setShowAbout(true)}
            className="ml-1 md:ml-2 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="About this project"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => setShowShortcuts(true)}
            className="hidden md:block text-xs text-gray-500 hover:text-gray-300 transition-colors"
            title="Keyboard shortcuts"
          >
            Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs">?</kbd> for shortcuts
          </button>
        </div>
        
        {/* Desktop Search Bar */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <SearchBar />
        </div>
        
        {/* Mobile Search Button */}
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="md:hidden text-gray-400 hover:text-white transition-colors p-2"
          aria-label="Toggle search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </header>
      
      {/* Mobile Search Dropdown */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800 px-6 py-3 sticky top-16 z-40">
          <SearchBar onResultSelected={() => setMobileSearchOpen(false)} />
        </div>
      )}
      
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </>
  );
}
