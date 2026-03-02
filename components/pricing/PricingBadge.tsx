'use client';

import { DollarSign } from 'lucide-react';
import { getPricingForDatacenter, formatCurrency, getPricingTier } from '@/lib/utils/pricing';
import { usePricingStore } from '@/store/pricingStore';

interface PricingBadgeProps {
  datacenterId: string;
  variant?: 'compact' | 'detailed';
  className?: string;
}

export function PricingBadge({ datacenterId, variant = 'compact', className = '' }: PricingBadgeProps) {
  const showPricing = usePricingStore((state) => state.showPricing);
  const pricingData = usePricingStore((state) => state.pricingData);

  if (!showPricing || pricingData === null) return null;

  const pricing = getPricingForDatacenter(pricingData, datacenterId);

  if (!pricing) return null;

  const { tier, color } = getPricingTier(pricing.totalBaselineMonthly);

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1 rounded-md bg-zinc-800/50 px-2 py-1 text-xs ${className}`}>
        <DollarSign className="h-3 w-3 text-green-400" />
        <span className="font-medium">{formatCurrency(pricing.totalBaselineMonthly, false)}/mo</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 rounded-lg bg-zinc-800/50 p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">Baseline Monthly Cost</span>
        <span className={`text-xs font-medium ${color}`}>{tier}</span>
      </div>

      <div className="text-2xl font-bold text-white">
        {formatCurrency(pricing.totalBaselineMonthly, false)}
        <span className="text-sm text-zinc-400">/month</span>
      </div>

      <div className="space-y-1 border-t border-zinc-700 pt-2">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Compute</span>
          <span className="text-zinc-200">{formatCurrency(pricing.pricing.compute.pricePerMonth)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Storage (1TB)</span>
          <span className="text-zinc-200">{formatCurrency(pricing.pricing.storage.baseline1TbMonth)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Transfer (10TB)</span>
          <span className="text-zinc-200">{formatCurrency(pricing.pricing.dataTransfer.baseline10TbMonth)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400">Database</span>
          <span className="text-zinc-200">{formatCurrency(pricing.pricing.database.pricePerMonth)}</span>
        </div>
      </div>

      {pricing.notes && (
        <div className="border-t border-zinc-700 pt-2 text-xs text-zinc-400">
          {pricing.notes}
        </div>
      )}
    </div>
  );
}
