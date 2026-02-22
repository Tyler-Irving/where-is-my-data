import type { DatacenterPricing, CustomScenario, ScenarioEstimate } from '@/types/pricing';
import pricingData from '@/lib/data/pricing.json';

/**
 * Get pricing for a specific datacenter
 */
export function getPricingForDatacenter(datacenterId: string): DatacenterPricing | null {
  return pricingData.datacenters.find(dc => dc.datacenterId === datacenterId) || null;
}

/**
 * Get all datacenters with pricing data
 */
export function getAllPricedDatacenters(): DatacenterPricing[] {
  return pricingData.datacenters;
}

/**
 * Calculate custom scenario estimate for a datacenter
 */
export function calculateScenarioEstimate(
  datacenterPricing: DatacenterPricing,
  scenario: CustomScenario
): ScenarioEstimate {
  const { computeInstances, storageTb, dataTransferTb, databaseInstances } = scenario;
  
  const compute = datacenterPricing.pricing.compute.pricePerMonth * computeInstances;
  const storage = datacenterPricing.pricing.storage.pricePerGbMonth * storageTb * 1024;
  const dataTransfer = datacenterPricing.pricing.dataTransfer.egressPricePerGb * dataTransferTb * 1024;
  const database = datacenterPricing.pricing.database.pricePerMonth * databaseInstances;
  
  return {
    datacenterId: datacenterPricing.datacenterId,
    displayName: datacenterPricing.displayName,
    provider: datacenterPricing.provider,
    breakdown: {
      compute,
      storage,
      dataTransfer,
      database,
    },
    total: compute + storage + dataTransfer + database,
  };
}

/**
 * Compare pricing across multiple datacenters for a custom scenario
 */
export function comparePricing(
  datacenterIds: string[],
  scenario: CustomScenario = { computeInstances: 1, storageTb: 1, dataTransferTb: 10, databaseInstances: 1 }
): ScenarioEstimate[] {
  const estimates = datacenterIds
    .map(id => {
      const pricing = getPricingForDatacenter(id);
      return pricing ? calculateScenarioEstimate(pricing, scenario) : null;
    })
    .filter((est): est is ScenarioEstimate => est !== null);
  
  // Find minimum cost
  const minCost = Math.min(...estimates.map(e => e.total));
  
  // Add relative cost percentage
  return estimates.map(est => ({
    ...est,
    relativeToMin: est.total === minCost 
      ? 'Cheapest' 
      : `+${Math.round(((est.total - minCost) / minCost) * 100)}%`,
  }));
}

/**
 * Get the cheapest datacenter for a given scenario
 */
export function getCheapestDatacenter(scenario?: CustomScenario): DatacenterPricing | null {
  const allDatacenters = getAllPricedDatacenters();
  
  if (!scenario) {
    // Use baseline pricing
    return allDatacenters.reduce((cheapest, current) => 
      current.totalBaselineMonthly < cheapest.totalBaselineMonthly ? current : cheapest
    );
  }
  
  // Calculate for custom scenario
  const estimates = allDatacenters.map(dc => calculateScenarioEstimate(dc, scenario));
  const cheapest = estimates.reduce((min, current) => 
    current.total < min.total ? current : min
  );
  
  return getPricingForDatacenter(cheapest.datacenterId);
}

/**
 * Format currency (USD)
 */
export function formatCurrency(amount: number, showCents: boolean = true): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(amount);
}

/**
 * Get pricing tier description
 */
export function getPricingTier(totalMonthly: number): { tier: string; color: string } {
  if (totalMonthly < 1600) return { tier: 'Budget Friendly', color: 'text-green-400' };
  if (totalMonthly < 1750) return { tier: 'Moderate', color: 'text-yellow-400' };
  return { tier: 'Premium', color: 'text-red-400' };
}

/**
 * Get price difference description
 */
export function getPriceDifference(price1: number, price2: number): string {
  const diff = Math.abs(price1 - price2);
  const percent = Math.round((diff / Math.min(price1, price2)) * 100);
  
  if (price1 === price2) return 'Same price';
  if (price1 < price2) return `${formatCurrency(diff)} cheaper (${percent}% less)`;
  return `${formatCurrency(diff)} more expensive (+${percent}%)`;
}
