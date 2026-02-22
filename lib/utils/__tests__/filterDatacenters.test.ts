import { describe, it, expect } from 'vitest';
import { filterDatacenters } from '../filterDatacenters';
import { Datacenter, ProviderType } from '@/types/datacenter';

function makeDC(overrides: Partial<Datacenter> = {}): Datacenter {
  return {
    id: 'dc-1',
    name: 'Test DC',
    provider: 'AWS',
    lat: 39.0,
    lng: -77.0,
    state: 'VA',
    powerStatus: 'none',
    waterStatus: 'none',
    verified: true,
    source: 'official',
    lastUpdated: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

const defaultFilters = {
  providers: new Set<string>(),
  providerTypes: new Set<ProviderType>(),
  capacityRange: [0, 500] as [number, number],
  pueRange: [1.0, 2.0] as [number, number],
  renewableOnly: false,
};

describe('filterDatacenters', () => {
  it('returns all datacenters when no filters are active', () => {
    const dcs = [makeDC({ id: '1' }), makeDC({ id: '2' })];
    expect(filterDatacenters(dcs, defaultFilters)).toHaveLength(2);
  });

  it('filters by provider', () => {
    const dcs = [
      makeDC({ id: '1', provider: 'AWS' }),
      makeDC({ id: '2', provider: 'Azure' }),
      makeDC({ id: '3', provider: 'Google' }),
    ];
    const result = filterDatacenters(dcs, {
      ...defaultFilters,
      providers: new Set(['AWS', 'Google']),
    });
    expect(result).toHaveLength(2);
    expect(result.map(d => d.provider)).toEqual(['AWS', 'Google']);
  });

  it('filters by provider type', () => {
    const dcs = [
      makeDC({ id: '1', metadata: { providerType: 'hyperscale-cloud' } }),
      makeDC({ id: '2', metadata: { providerType: 'colocation' } }),
      makeDC({ id: '3' }), // no providerType
    ];
    const result = filterDatacenters(dcs, {
      ...defaultFilters,
      providerTypes: new Set<ProviderType>(['hyperscale-cloud']),
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by capacity range', () => {
    const dcs = [
      makeDC({ id: '1', metadata: { capacityMW: 50 } }),
      makeDC({ id: '2', metadata: { capacityMW: 200 } }),
      makeDC({ id: '3', metadata: { capacityMW: 400 } }),
    ];
    const result = filterDatacenters(dcs, {
      ...defaultFilters,
      capacityRange: [100, 300],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('excludes DCs without capacity when range is non-default', () => {
    const dcs = [
      makeDC({ id: '1', metadata: { capacityMW: 150 } }),
      makeDC({ id: '2' }), // no capacity metadata
    ];
    const result = filterDatacenters(dcs, {
      ...defaultFilters,
      capacityRange: [100, 300],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by PUE range', () => {
    const dcs = [
      makeDC({ id: '1', metadata: { pue: 1.1 } }),
      makeDC({ id: '2', metadata: { pue: 1.5 } }),
      makeDC({ id: '3', metadata: { pue: 1.8 } }),
    ];
    const result = filterDatacenters(dcs, {
      ...defaultFilters,
      pueRange: [1.0, 1.3],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by renewable only', () => {
    const dcs = [
      makeDC({ id: '1', metadata: { renewable: true } }),
      makeDC({ id: '2', metadata: { renewable: false } }),
      makeDC({ id: '3' }), // no renewable field
    ];
    const result = filterDatacenters(dcs, {
      ...defaultFilters,
      renewableOnly: true,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('combines multiple filters', () => {
    const dcs = [
      makeDC({ id: '1', provider: 'AWS', metadata: { capacityMW: 200, renewable: true } }),
      makeDC({ id: '2', provider: 'AWS', metadata: { capacityMW: 200, renewable: false } }),
      makeDC({ id: '3', provider: 'Azure', metadata: { capacityMW: 200, renewable: true } }),
    ];
    const result = filterDatacenters(dcs, {
      ...defaultFilters,
      providers: new Set(['AWS']),
      renewableOnly: true,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});
