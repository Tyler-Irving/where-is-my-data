import { describe, it, expect } from 'vitest';
import type { Datacenter } from '@/types/datacenter';
import {
  calculateDistance,
  estimateLatency,
  getLatencyCategory,
  getLatencyColor,
  formatLatency,
  calculateLatencyBetween,
  createLatencyRoute,
  calculateMultiRegionLatency,
} from '../latency';

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

describe('calculateDistance', () => {
  it('returns 0 for the same point', () => {
    expect(calculateDistance(39.0, -77.0, 39.0, -77.0)).toBe(0);
  });

  it('returns approximate distance between New York and Los Angeles', () => {
    // NY: 40.71, -74.01  LA: 34.05, -118.24  — roughly 3940 km
    const dist = calculateDistance(40.71, -74.01, 34.05, -118.24);
    expect(dist).toBeGreaterThan(3800);
    expect(dist).toBeLessThan(4100);
  });

  it('is symmetric (A→B = B→A)', () => {
    const ab = calculateDistance(39.0, -77.0, 37.8, -122.4);
    const ba = calculateDistance(37.8, -122.4, 39.0, -77.0);
    expect(ab).toBeCloseTo(ba, 5);
  });
});

describe('estimateLatency', () => {
  it('returns near-zero latency for zero distance', () => {
    // 0 km → 0 base latency + 1 hop (ceil(0/500)=0 hops) * 0.5ms * 2 * 1.15 = 0
    expect(estimateLatency(0)).toBe(0);
  });

  it('returns a positive value for positive distance', () => {
    expect(estimateLatency(1000)).toBeGreaterThan(0);
  });

  it('increases with distance', () => {
    expect(estimateLatency(2000)).toBeGreaterThan(estimateLatency(1000));
  });

  it('matches the formula for 1000 km', () => {
    // baseLatencyMs = (1000 * 5) / 1000 = 5ms
    // routingOverhead = 1.3 → 6.5ms one-way
    // hops = ceil(1000/500) = 2 → 1.0ms
    // oneWay = 7.5ms, RTT = 7.5 * 2 * 1.15 = 17.25 → rounded to 1dp
    const result = estimateLatency(1000);
    expect(result).toBeCloseTo(17.3, 1);
  });
});

describe('getLatencyCategory', () => {
  it('returns excellent for < 10ms', () => {
    expect(getLatencyCategory(0)).toBe('excellent');
    expect(getLatencyCategory(9.9)).toBe('excellent');
  });

  it('returns good for 10–29ms', () => {
    expect(getLatencyCategory(10)).toBe('good');
    expect(getLatencyCategory(29.9)).toBe('good');
  });

  it('returns acceptable for 30–59ms', () => {
    expect(getLatencyCategory(30)).toBe('acceptable');
    expect(getLatencyCategory(59.9)).toBe('acceptable');
  });

  it('returns high for >= 60ms', () => {
    expect(getLatencyCategory(60)).toBe('high');
    expect(getLatencyCategory(200)).toBe('high');
  });
});

describe('getLatencyColor', () => {
  it('returns green for excellent latency', () => {
    expect(getLatencyColor(5)).toBe('#10b981');
  });

  it('returns blue for good latency', () => {
    expect(getLatencyColor(15)).toBe('#3b82f6');
  });

  it('returns amber for acceptable latency', () => {
    expect(getLatencyColor(45)).toBe('#f59e0b');
  });

  it('returns red for high latency', () => {
    expect(getLatencyColor(100)).toBe('#ef4444');
  });
});

describe('formatLatency', () => {
  it('returns "<1 ms" for sub-millisecond values', () => {
    expect(formatLatency(0.5)).toBe('<1 ms');
    expect(formatLatency(0)).toBe('<1 ms');
  });

  it('formats latency with one decimal place', () => {
    expect(formatLatency(5.5)).toBe('5.5 ms');
    expect(formatLatency(10)).toBe('10.0 ms');
  });
});

describe('calculateLatencyBetween', () => {
  it('returns a LatencyEstimate with correct IDs', () => {
    const dc1 = makeDC({ id: 'dc-east', lat: 39.0, lng: -77.0 });
    const dc2 = makeDC({ id: 'dc-west', lat: 37.8, lng: -122.4 });
    const result = calculateLatencyBetween(dc1, dc2);
    expect(result.fromDatacenterId).toBe('dc-east');
    expect(result.toDatacenterId).toBe('dc-west');
  });

  it('returns positive distance and latency', () => {
    const dc1 = makeDC({ id: 'dc-east', lat: 39.0, lng: -77.0 });
    const dc2 = makeDC({ id: 'dc-west', lat: 37.8, lng: -122.4 });
    const result = calculateLatencyBetween(dc1, dc2);
    expect(result.distanceKm).toBeGreaterThan(0);
    expect(result.distanceMiles).toBeGreaterThan(0);
    expect(result.estimatedLatencyMs).toBeGreaterThan(0);
  });

  it('uses displayName from metadata when available', () => {
    const dc1 = makeDC({ id: 'dc-1', name: 'Raw Name', metadata: { displayName: 'Pretty Name' } });
    const dc2 = makeDC({ id: 'dc-2' });
    const result = calculateLatencyBetween(dc1, dc2);
    expect(result.fromDisplayName).toBe('Pretty Name');
    expect(result.toDisplayName).toBe('Test DC');
  });

  it('includes a valid category', () => {
    const dc1 = makeDC({ id: 'a', lat: 39.0, lng: -77.0 });
    const dc2 = makeDC({ id: 'b', lat: 39.1, lng: -77.1 });
    const result = calculateLatencyBetween(dc1, dc2);
    expect(['excellent', 'good', 'acceptable', 'high']).toContain(result.category);
  });
});

describe('createLatencyRoute', () => {
  it('returns a route with correct coordinates and latency', () => {
    const dc1 = makeDC({ id: 'a', lat: 39.0, lng: -77.0 });
    const dc2 = makeDC({ id: 'b', lat: 37.8, lng: -122.4 });
    const estimate = calculateLatencyBetween(dc1, dc2);
    const route = createLatencyRoute(dc1, dc2, estimate);
    expect(route.from.lat).toBe(39.0);
    expect(route.from.lng).toBe(-77.0);
    expect(route.to.lat).toBe(37.8);
    expect(route.to.lng).toBe(-122.4);
    expect(route.latencyMs).toBe(estimate.estimatedLatencyMs);
    expect(route.color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('calculateMultiRegionLatency', () => {
  it('throws when fewer than 2 datacenters are provided', () => {
    expect(() => calculateMultiRegionLatency([])).toThrow();
    expect(() => calculateMultiRegionLatency([makeDC()])).toThrow();
  });

  it('returns correct number of pairwise latencies for 3 DCs', () => {
    const dcs = [
      makeDC({ id: 'a', lat: 39.0, lng: -77.0 }),
      makeDC({ id: 'b', lat: 37.8, lng: -122.4 }),
      makeDC({ id: 'c', lat: 41.8, lng: -87.6 }),
    ];
    const result = calculateMultiRegionLatency(dcs);
    // n=3 → n*(n-1)/2 = 3 pairs
    expect(result.pairwiseLatencies).toHaveLength(3);
  });

  it('returns averageLatency and maxLatency as numbers', () => {
    const dcs = [
      makeDC({ id: 'a', lat: 39.0, lng: -77.0 }),
      makeDC({ id: 'b', lat: 37.8, lng: -122.4 }),
    ];
    const result = calculateMultiRegionLatency(dcs);
    expect(typeof result.averageLatency).toBe('number');
    expect(typeof result.maxLatency).toBe('number');
    expect(result.maxLatency).toBeGreaterThanOrEqual(result.averageLatency);
  });
});
