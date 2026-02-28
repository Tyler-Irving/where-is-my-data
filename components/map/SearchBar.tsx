'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useDatacenterStore } from '@/store/datacenterStore';
import { useMapStore } from '@/store/mapStore';

interface SearchBarProps {
  onSearchResults?: (count: number) => void;
  onResultSelected?: () => void;
}

export const SearchBar = React.memo(function SearchBar({ onSearchResults, onResultSelected }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { datacenters } = useDatacenterStore();
  const { setViewport, selectDatacenter } = useMapStore();

  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    const searchLower = query.toLowerCase().trim();
    return datacenters.filter((dc) =>
      dc.name.toLowerCase().includes(searchLower) ||
      dc.provider.toLowerCase().includes(searchLower) ||
      dc.city?.toLowerCase().includes(searchLower) ||
      dc.state.toLowerCase().includes(searchLower) ||
      dc.metadata?.region?.toLowerCase().includes(searchLower)
    ).slice(0, 8);
  }, [query, datacenters]);

  useEffect(() => { onSearchResults?.(results.length); }, [results.length, onSearchResults]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && query) {
        setQuery('');
        setShowResults(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query]);

  const handleSelectResult = useCallback((datacenter: typeof datacenters[0]) => {
    setViewport({ longitude: datacenter.lng, latitude: datacenter.lat, zoom: 8, bearing: 0, pitch: 0 });
    selectDatacenter(datacenter.id);
    setQuery('');
    setShowResults(false);
    inputRef.current?.blur();
    onResultSelected?.();
  }, [setViewport, selectDatacenter, onResultSelected]);

  const handleClear = useCallback(() => {
    setQuery('');
    setShowResults(false);
    inputRef.current?.focus();
  }, []);

  const isMac = typeof navigator !== 'undefined' && navigator.platform?.includes('Mac');

  return (
    <div className="relative w-full">
      <div className={`relative flex items-center h-9 rounded-xl border transition-all duration-200 ${
        isFocused
          ? 'bg-white/[0.08] border-[#0066FF] ring-1 ring-[#0066FF]/30'
          : 'bg-white/[0.05] border-white/[0.08] hover:border-white/[0.16]'
      }`}>
        <Search className="w-3.5 h-3.5 text-white/35 ml-3 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => { setIsFocused(true); if (query) setShowResults(true); }}
          onBlur={() => { setIsFocused(false); setTimeout(() => setShowResults(false), 200); }}
          placeholder="Search datacenters…"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none px-2.5"
        />
        {query ? (
          <button onClick={handleClear} className="mr-2 flex-shrink-0 text-white/35 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        ) : !isFocused && (
          <div className="hidden md:flex items-center gap-1 mr-2.5 flex-shrink-0">
            <kbd className="px-1.5 py-0.5 bg-white/[0.08] border border-white/[0.12] rounded text-[10px] font-mono text-white/35">{isMac ? '⌘' : 'Ctrl'}</kbd>
            <kbd className="px-1.5 py-0.5 bg-white/[0.08] border border-white/[0.12] rounded text-[10px] font-mono text-white/35">K</kbd>
          </div>
        )}
      </div>

      {showResults && query && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl z-50 overflow-hidden shadow-2xl animate-in slide-up duration-200">
          <div className="px-3 py-2 border-b border-white/[0.06]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="p-1.5 max-h-72 overflow-y-auto scrollbar-hide">
            {results.map((dc) => (
              <button key={dc.id} onClick={() => handleSelectResult(dc)}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-[#0066FF] transition-colors">{dc.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{dc.provider} · {dc.city}, {dc.state}</p>
                </div>
                <svg className="w-4 h-4 text-white/20 group-hover:text-[#0066FF] flex-shrink-0 mt-0.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {showResults && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl z-50 p-4 text-center animate-in slide-up duration-200">
          <p className="text-sm text-white/60">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-xs text-white/30 mt-1">Try provider, city, or state</p>
        </div>
      )}
    </div>
  );
});
