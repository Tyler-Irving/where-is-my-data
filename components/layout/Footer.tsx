'use client';

import React from 'react';

export function Footer() {
  const lastUpdated = '2026-02-20';
  const githubUrl = 'https://github.com/Tyler-Irving/where-is-my-data';
  
  return (
    <footer className="bg-gray-900 border-t border-gray-800 px-4 md:px-6 py-3 md:py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-3 md:gap-4 text-xs md:text-sm">
          {/* Left: Credits & Data Sources */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-gray-400 text-center md:text-left">
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="hidden sm:inline">Built by</span>
              <a 
                href="https://tyler-irving.github.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Tyler Irving
              </a>
            </div>
            
            <span className="hidden md:inline text-gray-600">•</span>
            
            <div className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-xs">
              <span className="hidden sm:inline">Data sources:</span>
              <span className="text-gray-300">Official provider sites, PeeringDB</span>
            </div>
          </div>
          
          {/* Right: GitHub Link & Last Updated */}
          <div className="flex flex-col-reverse md:flex-row items-center gap-2 md:gap-4">
            <div className="text-gray-500 text-[10px] md:text-xs">
              Updated {lastUpdated}
            </div>
            
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors group touch-manipulation"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300 group-hover:text-white text-xs md:text-sm transition-colors">
                View Source
              </span>
            </a>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
