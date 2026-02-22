'use client';

import React from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal = React.memo(function KeyboardShortcutsModal({ 
  isOpen, 
  onClose 
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘/Ctrl + K', action: 'Focus search bar' },
    { key: 'Esc', action: 'Clear search / Close modals' },
    { key: '?', action: 'Show keyboard shortcuts' },
    { key: 'C', action: 'Open comparison view (when 2+ selected)' },
    { key: '+', action: 'Zoom in' },
    { key: '-', action: 'Zoom out' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-3">
            {shortcuts.map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <span className="text-gray-300">{shortcut.action}</span>
                <kbd className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono text-gray-300">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-gray-300 leading-relaxed">
              <span className="font-semibold text-blue-400">Tip:</span> Press <kbd className="px-2 py-0.5 bg-gray-800 rounded text-xs">?</kbd> at any time to show this panel again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
