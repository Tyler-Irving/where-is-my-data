'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { Dialog, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import { Dialog as DialogPrimitive } from 'radix-ui';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal = React.memo(function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  const shortcuts = [
    { key: '⌘ K', action: 'Focus search bar' },
    { key: 'Esc', action: 'Clear search / Close modals' },
    { key: '?', action: 'Show keyboard shortcuts' },
    { key: 'C', action: 'Open comparison (2+ selected)' },
    { key: 'L', action: 'Open Latency Calculator (2+ selected)' },
    { key: '+', action: 'Zoom in' },
    { key: '−', action: 'Zoom out' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-label="Keyboard shortcuts"
          className="fixed inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-full sm:max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-[#0a0a0a] border border-white/[0.10] rounded-t-2xl sm:rounded-2xl shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-2 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95 duration-200 outline-none focus:outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                <Keyboard className="h-4 w-4 text-white/60" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Keyboard Shortcuts</h2>
                <p className="text-xs text-white/35">Quick reference</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/35 hover:text-white hover:bg-white/[0.08] transition-all"
              aria-label="Close keyboard shortcuts"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Shortcuts list */}
          <div className="p-5">
            <div className="space-y-0">
              {shortcuts.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0"
                >
                  <span className="text-sm text-white/60">{s.action}</span>
                  <kbd className="bg-white/[0.08] border border-white/[0.12] rounded-lg px-2.5 py-1 text-xs font-mono text-white/80 flex-shrink-0 ml-4">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>

            {/* Tip */}
            <div className="mt-5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
              <p className="text-xs text-white/40 leading-relaxed">
                <span className="text-white/60 font-semibold">Tip:</span> Press{' '}
                <kbd className="bg-white/[0.08] border border-white/[0.12] rounded px-1.5 py-0.5 text-[10px] font-mono text-white/70">?</kbd>
                {' '}at any time to show this panel.
              </p>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
});
