'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  // Search results
  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    
    const searchLower = query.toLowerCase().trim();
    
    return datacenters
      .filter((dc) => {
        return (
          dc.name.toLowerCase().includes(searchLower) ||
          dc.provider.toLowerCase().includes(searchLower) ||
          dc.city?.toLowerCase().includes(searchLower) ||
          dc.state.toLowerCase().includes(searchLower) ||
          dc.metadata?.region?.toLowerCase().includes(searchLower)
        );
      })
      .slice(0, 8); // Limit to 8 results for UI
  }, [query, datacenters]);

  // Notify parent of results count
  useEffect(() => {
    onSearchResults?.(results.length);
  }, [results.length, onSearchResults]);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to clear
      if (e.key === 'Escape' && query) {
        setQuery('');
        setShowResults(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query]);

  // Handle result selection
  const handleSelectResult = useCallback((datacenter: typeof datacenters[0]) => {
    // Zoom to datacenter
    setViewport({
      longitude: datacenter.lng,
      latitude: datacenter.lat,
      zoom: 8,
      bearing: 0,
      pitch: 0,
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    
    // Select datacenter
    selectDatacenter(datacenter.id);
    
    // Clear search
    setQuery('');
    setShowResults(false);
    inputRef.current?.blur();
    
    // Notify parent (for mobile close)
    onResultSelected?.();
  }, [setViewport, selectDatacenter, onResultSelected]);

  // Clear search
  const handleClear = useCallback(() => {
    setQuery('');
    setShowResults(false);
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className={`relative transition-all ${
        isFocused 
          ? 'ring-2 ring-blue-500 bg-gray-800' 
          : 'bg-gray-800 hover:bg-gray-750'
      } rounded-lg border border-gray-700`}>
        <div className="flex items-center gap-2 px-3 py-2">
          {/* Search Icon */}
          <svg 
            className="w-5 h-5 text-gray-400 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              if (query) setShowResults(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              // Delay to allow click on results
              setTimeout(() => setShowResults(false), 200);
            }}
            placeholder="Search datacenters..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
          />

          {/* Clear Button */}
          {query && (
            <button
              onClick={handleClear}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Keyboard Hint */}
          {!query && !isFocused && (
            <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
              <kbd className="px-1.5 py-0.5 bg-gray-900 border border-gray-600 rounded text-[10px] font-mono">
                {typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-900 border border-gray-600 rounded text-[10px] font-mono">
                K
              </kbd>
            </div>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && query && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-[400px] overflow-y-auto transition-all duration-200 ease-out">
          <div className="p-2">
            {/* Results header */}
            <div className="px-3 py-2 text-xs text-gray-400 font-medium border-b border-gray-800">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </div>

            {/* Results list */}
            <div className="mt-1 space-y-1">
              {results.map((dc) => (
                <button
                  key={dc.id}
                  onClick={() => handleSelectResult(dc)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                        {dc.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {dc.provider}
                        </span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-400">
                          {dc.city}, {dc.state}
                        </span>
                      </div>
                      {dc.metadata?.region && (
                        <div className="text-xs text-gray-500 mt-0.5 capitalize">
                          {dc.metadata.region.replace(/-/g, ' ')}
                        </div>
                      )}
                    </div>
                    
                    {/* Go icon */}
                    <svg 
                      className="w-4 h-4 text-gray-600 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 p-4 text-center transition-all duration-200 ease-out">
          <div className="text-gray-400 text-sm">
            No datacenters found for "{query}"
          </div>
          <div className="text-gray-500 text-xs mt-1">
            Try searching by name, provider, city, or state
          </div>
        </div>
      )}
    </div>
  );
});
