import { describe, it, expect } from 'vitest';
import type { DatacenterPricing, CustomScenario } from '@/types/pricing';
import {
  formatCurrency,
  getPricingTier,
  getPriceDifference,
  getAllPricedDatacenters,
  getPricingForDatacenter,
  calculateScenarioEstimate,
  comparePricing,
  getCheapestDatacenter,
} from '../pricing';

// Minimal DatacenterPricing fixture for unit tests
const mockPricing: DatacenterPricing = {
  datacenterId: 'test-dc',
  provider: 'AWS',
  region: 'us-east-1',
  displayName: 'Test DC',
  pricing: {
    compute: { pricePerHour: 0.096, pricePerMonth: 69.12 },
    storage: { pricePerGbMonth: 0.023, baseline1TbMonth: 23.55 },
    dataTransfer: { egressPricePerGb: 0.09, baseline10TbMonth: 921.6 },
    database: { pricePerHour: 0.115, pricePerMonth: 82.8 },
  },
  totalBaselineMonthly: 1097.07,
};

const defaultScenario: CustomScenario = {
  computeInstances: 1,
  storageTb: 1,
  dataTransferTb: 10,
  databaseInstances: 1,
};

describe('formatCurrency', () => {
  it('formats with two decimal places by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats without cents when showCents is false', () => {
    expect(formatCurrency(1234.56, false)).toBe('$1,235');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

describe('getPricingTier', () => {
  it('returns Budget Friendly for totals below 1600', () => {
    const { tier } = getPricingTier(1500);
    expect(tier).toBe('Budget Friendly');
  });

  it('returns Moderate for totals between 1600 and 1749', () => {
    const { tier } = getPricingTier(1700);
    expect(tier).toBe('Moderate');
  });

  it('returns Premium for totals 1750 and above', () => {
    const { tier } = getPricingTier(2000);
    expect(tier).toBe('Premium');
  });

  it('returns a color string for each tier', () => {
    expect(getPricingTier(1500).color).toBeTruthy();
    expect(getPricingTier(1700).color).toBeTruthy();
    expect(getPricingTier(2000).color).toBeTruthy();
  });
});

describe('getPriceDifference', () => {
  it('returns "Same price" for equal prices', () => {
    expect(getPriceDifference(1000, 1000)).toBe('Same price');
  });

  it('returns a "cheaper" string when price1 < price2', () => {
    const result = getPriceDifference(800, 1000);
    expect(result).toContain('cheaper');
  });

  it('returns a "more expensive" string when price1 > price2', () => {
    const result = getPriceDifference(1200, 1000);
    expect(result).toContain('more expensive');
  });

  it('includes the percentage in the result', () => {
    // 1200 vs 1000 → 20% more expensive
    expect(getPriceDifference(1200, 1000)).toContain('20%');
  });
});

describe('getAllPricedDatacenters', () => {
  it('returns a non-empty array of datacenters', () => {
    expect(getAllPricedDatacenters().length).toBeGreaterThan(0);
  });

  it('returns objects with a datacenterId field', () => {
    const all = getAllPricedDatacenters();
    expect(all.every(dc => typeof dc.datacenterId === 'string')).toBe(true);
  });
});

describe('getPricingForDatacenter', () => {
  it('returns pricing data for a known datacenter ID', () => {
    const result = getPricingForDatacenter('aws-us-east-1');
    expect(result).not.toBeNull();
    expect(result?.datacenterId).toBe('aws-us-east-1');
  });

  it('returns null for an unknown datacenter ID', () => {
    expect(getPricingForDatacenter('nonexistent-dc')).toBeNull();
  });
});

describe('calculateScenarioEstimate', () => {
  it('calculates compute cost as pricePerMonth × instances', () => {
    const estimate = calculateScenarioEstimate(mockPricing, defaultScenario);
    expect(estimate.breakdown.compute).toBeCloseTo(69.12);
  });

  it('calculates storage cost as pricePerGbMonth × TB × 1024', () => {
    const estimate = calculateScenarioEstimate(mockPricing, defaultScenario);
    // 0.023 * 1 * 1024 = 23.552
    expect(estimate.breakdown.storage).toBeCloseTo(23.55, 1);
  });

  it('total equals sum of all breakdown components', () => {
    const estimate = calculateScenarioEstimate(mockPricing, defaultScenario);
    const { compute, storage, dataTransfer, database } = estimate.breakdown;
    expect(estimate.total).toBeCloseTo(compute + storage + dataTransfer + database, 5);
  });

  it('returns the correct datacenterId and provider', () => {
    const estimate = calculateScenarioEstimate(mockPricing, defaultScenario);
    expect(estimate.datacenterId).toBe('test-dc');
    expect(estimate.provider).toBe('AWS');
  });

  it('scales with multiple instances', () => {
    const scenario2x: CustomScenario = { ...defaultScenario, computeInstances: 2 };
    const single = calculateScenarioEstimate(mockPricing, defaultScenario);
    const double = calculateScenarioEstimate(mockPricing, scenario2x);
    expect(double.breakdown.compute).toBeCloseTo(single.breakdown.compute * 2);
  });
});

describe('comparePricing', () => {
  it('marks one result as "Cheapest"', () => {
    const results = comparePricing(['aws-us-east-1', 'aws-us-west-1']);
    expect(results.some(r => r.relativeToMin === 'Cheapest')).toBe(true);
  });

  it('marks the more expensive one with a "+N%" string', () => {
    const results = comparePricing(['aws-us-east-1', 'aws-us-west-1']);
    const expensive = results.find(r => r.relativeToMin !== 'Cheapest');
    expect(expensive?.relativeToMin).toMatch(/^\+\d+%$/);
  });

  it('skips unknown datacenter IDs silently', () => {
    const results = comparePricing(['aws-us-east-1', 'nonexistent']);
    expect(results).toHaveLength(1);
  });
});

describe('getCheapestDatacenter', () => {
  it('returns a DatacenterPricing object', () => {
    const result = getCheapestDatacenter();
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('datacenterId');
  });

  it('returns the datacenter with the lowest baseline cost', () => {
    const cheapest = getCheapestDatacenter();
    const all = getAllPricedDatacenters();
    const minBaseline = Math.min(...all.map(dc => dc.totalBaselineMonthly));
    expect(cheapest?.totalBaselineMonthly).toBe(minBaseline);
  });
});
