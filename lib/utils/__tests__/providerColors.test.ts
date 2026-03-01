import { describe, it, expect } from 'vitest';
import {
  PROVIDER_TYPE_LABELS,
  getProviderMetadata,
  getProviderColor,
  getProviderTextColor,
  getAllProviders,
} from '../providerColors';

describe('PROVIDER_TYPE_LABELS', () => {
  it('maps hyperscale-cloud to a human-readable label', () => {
    expect(PROVIDER_TYPE_LABELS['hyperscale-cloud']).toBe('Hyperscale Cloud');
  });

  it('covers all 5 provider types', () => {
    const keys = Object.keys(PROVIDER_TYPE_LABELS);
    expect(keys).toContain('hyperscale-cloud');
    expect(keys).toContain('tech-giant');
    expect(keys).toContain('colocation');
    expect(keys).toContain('regional-cloud');
    expect(keys).toContain('edge-cdn');
  });
});

describe('getProviderMetadata', () => {
  it('returns metadata for a known provider', () => {
    const meta = getProviderMetadata('AWS');
    expect(meta).not.toBeNull();
    expect(meta?.name).toBe('AWS');
  });

  it('is case-insensitive', () => {
    const upper = getProviderMetadata('AWS');
    const lower = getProviderMetadata('aws');
    expect(upper?.id).toBe(lower?.id);
  });

  it('returns null for an unknown provider', () => {
    expect(getProviderMetadata('NONEXISTENT_CLOUD')).toBeNull();
  });

  it('returns objects with color and textColor fields', () => {
    const meta = getProviderMetadata('AWS');
    expect(meta?.color).toBeTruthy();
    expect(meta?.textColor).toBeTruthy();
  });
});

describe('getProviderColor', () => {
  it('returns the correct hex color for AWS', () => {
    // AWS orange from providers.json
    expect(getProviderColor('AWS')).toBe('#FF9900');
  });

  it('returns default gray for an unknown provider', () => {
    expect(getProviderColor('UNKNOWN_PROVIDER')).toBe('#6B7280');
  });

  it('is case-insensitive', () => {
    expect(getProviderColor('aws')).toBe(getProviderColor('AWS'));
  });
});

describe('getProviderTextColor', () => {
  it('returns the provider text color for a known provider', () => {
    const color = getProviderTextColor('AWS');
    // AWS textColor is #FFFFFF per providers.json
    expect(color).toBe('#FFFFFF');
  });

  it('returns white (#FFFFFF) as default for unknown providers', () => {
    expect(getProviderTextColor('UNKNOWN_PROVIDER')).toBe('#FFFFFF');
  });
});

describe('getAllProviders', () => {
  it('returns a non-empty array of providers', () => {
    const providers = getAllProviders();
    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
  });

  it('each provider has required fields', () => {
    const providers = getAllProviders();
    for (const p of providers) {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('name');
      expect(p).toHaveProperty('color');
      expect(p).toHaveProperty('textColor');
    }
  });
});
