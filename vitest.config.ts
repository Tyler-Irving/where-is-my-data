import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // jsdom enables React hooks and DOM APIs in tests (required for component testing)
    // Requires jsdom to be installed: npm install -D jsdom
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['lib/utils/**'],
      exclude: ['lib/utils/__tests__/**'],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
