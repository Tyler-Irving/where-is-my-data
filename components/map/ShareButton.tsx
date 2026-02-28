'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export const ShareButton = React.memo(function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const pillBase = 'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-200 border whitespace-nowrap';

  return (
    <button
      onClick={handleShare}
      className={`${pillBase} ${copied ? 'bg-[#00D084] border-[#00D084] text-white' : 'bg-white/[0.05] border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.10]'}`}
      aria-label="Share current view"
      title="Share current view"
    >
      {copied ? (
        <><Check className="w-3 h-3" /><span className="hidden sm:inline">Copied!</span></>
      ) : (
        <><Share2 className="w-3 h-3" /><span className="hidden sm:inline">Share</span></>
      )}
    </button>
  );
});
