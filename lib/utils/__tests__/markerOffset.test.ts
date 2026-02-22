import { describe, it, expect } from 'vitest';
import { calculateMarkerOffsets, buildColocatedCountMap, getColocatedCount } from '../markerOffset';
import { Datacenter } from '@/types/datacenter';

function makeDC(id: string, lat: number, lng: number): Datacenter {
  return {
    id,
    name: `DC ${id}`,
    provider: 'AWS',
    lat,
    lng,
    state: 'VA',
    powerStatus: 'none',
    waterStatus: 'none',
    verified: true,
    source: 'official',
    lastUpdated: '2026-01-01T00:00:00Z',
  };
}

describe('calculateMarkerOffsets', () => {
  it('returns original coordinates for single datacenter at a location', () => {
    const dcs = [makeDC('1', 39.0, -77.0)];
    const result = calculateMarkerOffsets(dcs);

    expect(result).toHaveLength(1);
    expect(result[0].offsetLat).toBe(39.0);
    expect(result[0].offsetLng).toBe(-77.0);
  });

  it('applies offsets for overlapping datacenters', () => {
    const dcs = [
      makeDC('1', 39.0, -77.0),
      makeDC('2', 39.0, -77.0),
    ];
    const result = calculateMarkerOffsets(dcs);

    expect(result).toHaveLength(2);
    // Both should have different offset coordinates
    const coords = result.map(r => `${r.offsetLat},${r.offsetLng}`);
    expect(new Set(coords).size).toBe(2);
  });

  it('does not offset datacenters at different locations', () => {
    const dcs = [
      makeDC('1', 39.0, -77.0),
      makeDC('2', 40.0, -78.0),
    ];
    const result = calculateMarkerOffsets(dcs);

    expect(result).toHaveLength(2);
    expect(result[0].offsetLat).toBe(39.0);
    expect(result[1].offsetLat).toBe(40.0);
  });

  it('handles empty input', () => {
    expect(calculateMarkerOffsets([])).toEqual([]);
  });
});

describe('buildColocatedCountMap', () => {
  it('counts datacenters at each coordinate', () => {
    const dcs = [
      makeDC('1', 39.0, -77.0),
      makeDC('2', 39.0, -77.0),
      makeDC('3', 40.0, -78.0),
    ];
    const countMap = buildColocatedCountMap(dcs);

    expect(getColocatedCount(countMap, 39.0, -77.0)).toBe(2);
    expect(getColocatedCount(countMap, 40.0, -78.0)).toBe(1);
  });

  it('returns 0 for unknown coordinates', () => {
    const countMap = buildColocatedCountMap([]);
    expect(getColocatedCount(countMap, 0, 0)).toBe(0);
  });
});
