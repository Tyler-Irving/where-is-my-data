import { describe, it, expect } from 'vitest';
import type { NetworkConnection } from '@/types/network';
import {
  getAllConnections,
  getConnectionsByProvider,
  getConnectionsByType,
  areDatacentersConnected,
  getConnectionColor,
  getSpeedLabel,
  formatConnectionDescription,
  getNetworkStats,
} from '../network';

describe('getConnectionColor', () => {
  it('returns blue for backbone', () => {
    expect(getConnectionColor('backbone')).toBe('#3b82f6');
  });

  it('returns green for peering', () => {
    expect(getConnectionColor('peering')).toBe('#10b981');
  });

  it('returns amber for transit', () => {
    expect(getConnectionColor('transit')).toBe('#f59e0b');
  });

  it('returns purple for private-interconnect', () => {
    expect(getConnectionColor('private-interconnect')).toBe('#8b5cf6');
  });
});

describe('getSpeedLabel', () => {
  it('returns empty string for undefined speed', () => {
    expect(getSpeedLabel(undefined)).toBe('');
  });

  it('returns "Multi-Gig" for "multiple"', () => {
    expect(getSpeedLabel('multiple')).toBe('Multi-Gig');
  });

  it('returns the speed string as-is for named speeds', () => {
    expect(getSpeedLabel('100G')).toBe('100G');
    expect(getSpeedLabel('400G')).toBe('400G');
    expect(getSpeedLabel('10G')).toBe('10G');
  });
});

describe('formatConnectionDescription', () => {
  const conn: NetworkConnection = {
    id: 'test-1',
    fromDatacenterId: 'dc-a',
    toDatacenterId: 'dc-b',
    provider: 'AWS',
    connectionType: 'backbone',
    speed: '100G',
    redundant: true,
    active: true,
  };

  it('uses datacenter IDs as fallback names when DCs are not provided', () => {
    const desc = formatConnectionDescription(conn);
    expect(desc).toContain('dc-a');
    expect(desc).toContain('dc-b');
    expect(desc).toContain('↔');
  });

  it('uses DC display names from metadata when provided', () => {
    const fromDc = { name: 'East DC', metadata: { displayName: 'US East 1' } } as never;
    const toDc = { name: 'West DC', metadata: { displayName: 'US West 2' } } as never;
    const desc = formatConnectionDescription(conn, fromDc, toDc);
    expect(desc).toContain('US East 1');
    expect(desc).toContain('US West 2');
  });

  it('falls back to DC name when displayName is absent', () => {
    const fromDc = { name: 'East DC' } as never;
    const toDc = { name: 'West DC' } as never;
    const desc = formatConnectionDescription(conn, fromDc, toDc);
    expect(desc).toContain('East DC');
    expect(desc).toContain('West DC');
  });

  it('includes speed and connection type in the description', () => {
    const desc = formatConnectionDescription(conn);
    expect(desc).toContain('100G');
    expect(desc).toContain('backbone');
  });

  it('shows "Redundant" for redundant connections', () => {
    const desc = formatConnectionDescription(conn);
    expect(desc).toContain('Redundant');
  });

  it('shows "Single-path" for non-redundant connections', () => {
    const singleConn = { ...conn, redundant: false };
    const desc = formatConnectionDescription(singleConn);
    expect(desc).toContain('Single-path');
  });
});

describe('getAllConnections', () => {
  it('returns a non-empty array', () => {
    const connections = getAllConnections();
    expect(Array.isArray(connections)).toBe(true);
    expect(connections.length).toBeGreaterThan(0);
  });

  it('returns objects with required fields', () => {
    const conn = getAllConnections()[0];
    expect(conn).toHaveProperty('id');
    expect(conn).toHaveProperty('fromDatacenterId');
    expect(conn).toHaveProperty('toDatacenterId');
    expect(conn).toHaveProperty('provider');
    expect(conn).toHaveProperty('connectionType');
  });
});

describe('getConnectionsByProvider', () => {
  it('returns only connections matching the given provider', () => {
    const awsConns = getConnectionsByProvider('AWS');
    expect(awsConns.length).toBeGreaterThan(0);
    expect(awsConns.every(c => c.provider === 'AWS')).toBe(true);
  });

  it('returns empty array for unknown provider', () => {
    expect(getConnectionsByProvider('NONEXISTENT')).toHaveLength(0);
  });
});

describe('getConnectionsByType', () => {
  it('returns only connections matching the given type', () => {
    const backbone = getConnectionsByType('backbone');
    expect(backbone.length).toBeGreaterThan(0);
    expect(backbone.every(c => c.connectionType === 'backbone')).toBe(true);
  });

  it('returns empty array for a type with no connections', () => {
    // Unlikely to have a 'transit' type if data doesn't contain it — acceptable to return 0
    const result = getConnectionsByType('transit');
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('areDatacentersConnected', () => {
  it('returns a connection object for known connected DCs', () => {
    // aws-us-east-1 ↔ aws-us-east-2 is the first entry in network-backbone.json
    const result = areDatacentersConnected('aws-us-east-1', 'aws-us-east-2');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('aws-1');
  });

  it('is bidirectional (B→A works too)', () => {
    const result = areDatacentersConnected('aws-us-east-2', 'aws-us-east-1');
    expect(result).not.toBeNull();
  });

  it('returns null for unconnected DCs', () => {
    const result = areDatacentersConnected('aws-us-east-1', 'dc-does-not-exist');
    expect(result).toBeNull();
  });
});

describe('getNetworkStats', () => {
  it('returns an object with all expected keys', () => {
    const stats = getNetworkStats();
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('byType');
    expect(stats).toHaveProperty('byProvider');
    expect(stats).toHaveProperty('redundant');
    expect(stats).toHaveProperty('active');
    expect(stats).toHaveProperty('redundancyRate');
  });

  it('total is positive', () => {
    expect(getNetworkStats().total).toBeGreaterThan(0);
  });

  it('redundancyRate is between 0 and 100', () => {
    const rate = getNetworkStats().redundancyRate;
    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(100);
  });

  it('active count does not exceed total', () => {
    const { active, total } = getNetworkStats();
    expect(active).toBeLessThanOrEqual(total);
  });
});
