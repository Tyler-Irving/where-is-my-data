'use client';

import React from 'react';
import { X, Info, Check } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal = React.memo(function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  const features = [
    '131 datacenter locations across the US',
    'Filter by provider, type, capacity & PUE',
    'Search by name, city, or state',
    'Latency calculator between regions',
    'Cost estimator across cloud providers',
    'Network backbone visualization',
    'Side-by-side datacenter comparison',
    'Export filtered data as CSV or JSON',
    'Shareable URLs with filter state',
    'Real-time stats and metrics',
  ];

  const techStack = ['Next.js 16', 'TypeScript', 'React 19', 'Tailwind CSS', 'Mapbox GL JS', 'Zustand'];

  const categories = [
    { label: 'Hyperscale Cloud', value: 'AWS, Azure, GCP, Oracle, IBM' },
    { label: 'Tech Giants', value: 'Meta, Google, Apple, Microsoft, xAI' },
    { label: 'Colocation', value: 'Equinix, Digital Realty, CoreSite, Switch' },
    { label: 'Regional Cloud', value: 'DigitalOcean, Vultr, Linode, OVH' },
    { label: 'Edge / CDN', value: 'Cloudflare' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-[#0a0a0a] border border-white/[0.10] rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-up duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0066FF]/15 border border-[#0066FF]/20 flex items-center justify-center">
              <Info className="h-4 w-4 text-[#0066FF]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">About This Project</h2>
              <p className="text-xs text-white/35">Where Is My Data?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/35 hover:text-white hover:bg-white/[0.08] transition-all"
            aria-label="Close about dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto scrollbar-hide flex-1 p-5 space-y-6">
          {/* Overview */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">What is this?</p>
            <p className="text-sm text-white/60 leading-relaxed">
              An interactive map showing <span className="text-white font-semibold">131 datacenter locations</span> across the United States from <span className="text-white font-semibold">major providers</span>. Explore hyperscale cloud facilities, colocation centers, tech giant datacenters, and edge computing infrastructure all in one place.
            </p>
          </section>

          {/* Features */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Features</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2.5 bg-white/[0.03] rounded-xl px-3 py-2">
                  <Check className="w-3.5 h-3.5 text-[#0066FF] flex-shrink-0" />
                  <span className="text-xs text-white/60">{f}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Tech Stack */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span key={tech} className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white/50 font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Data Sources */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Data Sources</p>
            <div className="bg-[#0066FF]/10 border border-[#0066FF]/15 rounded-xl p-4">
              <p className="text-sm text-white/50 leading-relaxed">
                Datacenter locations compiled from <span className="text-white/80 font-medium">official provider websites</span>, <span className="text-white/80 font-medium">PeeringDB</span>, and public infrastructure databases. Data includes capacity (MW), PUE ratings, renewable energy status, and availability zones where available.
              </p>
            </div>
          </section>

          {/* Provider Categories */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-3">Provider Categories</p>
            <div className="space-y-2">
              {categories.map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3 text-sm">
                  <span className="text-white/35 w-32 flex-shrink-0 pt-px">{label}:</span>
                  <span className="text-white/60">{value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Links */}
          <section className="border-t border-white/[0.06] pt-5 flex flex-col sm:flex-row gap-3">
            <a
              href="https://github.com/Tyler-Irving/where-is-my-data"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] hover:border-white/[0.16] rounded-xl transition-all group"
            >
              <svg className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-white/60 group-hover:text-white transition-colors">Source Code</span>
            </a>
            <a
              href="https://tyler-irving.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 bg-[#0066FF]/10 hover:bg-[#0066FF]/20 border border-[#0066FF]/20 hover:border-[#0066FF]/40 rounded-xl transition-all"
            >
              <svg className="w-4 h-4 text-[#0066FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-semibold text-[#0066FF]">Portfolio</span>
            </a>
          </section>
        </div>
      </div>
    </div>
  );
});
