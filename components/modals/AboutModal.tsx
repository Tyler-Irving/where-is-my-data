'use client';

import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal = React.memo(function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-white">About This Project</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overview */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3">What is this?</h3>
            <p className="text-gray-300 leading-relaxed">
              An interactive map showing <strong className="text-white">107 datacenter locations</strong> across the United States from <strong className="text-white">24 major providers</strong>. 
              Explore hyperscale cloud facilities, colocation centers, tech giant datacenters, and edge computing infrastructure all in one place.
            </p>
          </section>

          {/* Features */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300 text-sm">Interactive map with 107 datacenter locations</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300 text-sm">Filter by provider, type, capacity, PUE, and renewable energy</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300 text-sm">Search datacenters by name, city, or state</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300 text-sm">Real-time statistics and metrics</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300 text-sm">Shareable URLs with filter state</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300 text-sm">Export filtered data (CSV/JSON)</span>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3">Tech Stack</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'Next.js 14',
                'TypeScript',
                'React 19',
                'Tailwind CSS',
                'Mapbox GL JS',
                'Zustand',
              ].map((tech) => (
                <div key={tech} className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 text-center">
                  {tech}
                </div>
              ))}
            </div>
          </section>

          {/* Data Sources */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3">Data Sources</h3>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                Datacenter locations compiled from <strong className="text-blue-400">official provider websites</strong>, <strong className="text-blue-400">PeeringDB</strong>, and public infrastructure databases. 
                Data includes capacity (MW), PUE ratings, renewable energy status, and availability zones where available.
              </p>
            </div>
          </section>

          {/* Provider Types */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3">Provider Categories</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <span className="w-32 text-gray-400">Hyperscale Cloud:</span>
                <span className="text-gray-300">AWS, Azure, GCP, Oracle, IBM, Alibaba</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="w-32 text-gray-400">Tech Giants:</span>
                <span className="text-gray-300">Meta, Google, Apple, Microsoft, xAI</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="w-32 text-gray-400">Colocation:</span>
                <span className="text-gray-300">Equinix, Digital Realty, CoreSite, Switch, and more</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="w-32 text-gray-400">Regional Cloud:</span>
                <span className="text-gray-300">DigitalOcean, Vultr, Linode, OVH, Hetzner</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="w-32 text-gray-400">Edge/CDN:</span>
                <span className="text-gray-300">Cloudflare</span>
              </div>
            </div>
          </section>

          {/* Links */}
          <section className="pt-4 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://github.com/Tyler-Irving/where-is-my-data"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors group"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 group-hover:text-white font-medium">View Source Code</span>
              </a>
              <a
                href="https://tyler-irving.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors group"
              >
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-blue-400 font-medium">Portfolio</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
});
