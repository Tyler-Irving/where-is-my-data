# Cost Estimator Implementation Plan

## Overview
Add regional cost comparison functionality to the datacenter map, allowing users to estimate and compare costs across different datacenters/regions for common cloud services.

## Research: Pricing Data Sources

### AWS Pricing
- **AWS Price List API**: Official JSON-based API
  - Endpoint: `https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/index.json`
  - Per-region pricing for EC2, S3, RDS, etc.
  - Updated regularly, comprehensive
  
### Google Cloud Pricing
- **Cloud Billing Catalog API**: Official pricing API
  - REST API with SKU-level pricing
  - Regional pricing included
  
### Azure Pricing
- **Azure Retail Prices API**: Official REST API
  - Endpoint: `https://prices.azure.com/api/retail/prices`
  - Regional pricing, SKU-based

### Challenges
1. APIs require parsing complex SKU structures
2. Pricing changes frequently
3. Different pricing models (on-demand, reserved, spot)
4. Data volume is large (thousands of SKUs)

## Design Approach

### Option A: Live API Integration (Complex)
- Real-time pricing from provider APIs
- Pros: Always accurate, comprehensive
- Cons: Slow, complex parsing, rate limits, large bundle size

### Option B: Simplified Static Pricing (Recommended)
- Pre-calculated pricing for common baseline services
- Update monthly or quarterly via script
- Pros: Fast, simple, good UX
- Cons: Slightly outdated, simplified

### Option C: Hybrid
- Static pricing for common scenarios
- Link to official calculators for detailed estimates

## Recommended: Option B (Static with Common Scenarios)

### Baseline Services to Include
1. **Compute**: 1x c5.2xlarge equivalent (8 vCPU, 16GB RAM) - $250-300/month
2. **Storage**: 1TB block storage - $100-150/month
3. **Data Transfer**: 10TB egress - $900-1200/month
4. **Database**: db.m5.large equivalent - $150-200/month

### Data Model

```typescript
interface RegionalPricing {
  datacenterId: string;
  provider: string;
  region: string;
  lastUpdated: string;
  currency: 'USD';
  pricing: {
    compute: {
      instanceType: string;  // e.g., "c5.2xlarge"
      vcpus: number;
      memoryGb: number;
      pricePerHour: number;
      pricePerMonth: number;
    };
    storage: {
      type: string;  // e.g., "gp3", "Premium SSD"
      pricePerGbMonth: number;
      baseline1TbMonth: number;
    };
    dataTransfer: {
      egressPricePerGb: number;
      baseline10TbMonth: number;
    };
    database: {
      instanceType: string;
      vcpus: number;
      memoryGb: number;
      pricePerHour: number;
      pricePerMonth: number;
    };
  };
  totalBaselineMonthly: number;  // Sum of all baseline services
}
```

### Data File Structure
```
lib/data/
├── datacenters.json (existing)
├── providers.json (existing)
└── pricing.json (new)
```

## Implementation Plan

### Phase 1: Data Collection & Structure
1. Create pricing.json with baseline costs for major datacenters
2. Source: AWS Simple Monthly Calculator, GCP Pricing Calculator, Azure Calculator
3. Focus on: AWS, Google Cloud, Azure (top 3 hyperscale providers)
4. Coverage: ~30-40 major datacenters (enough for meaningful comparison)

### Phase 2: Backend/Data Layer
1. Add pricing store to Zustand state management
2. Create pricing utilities:
   - `getPricingForDatacenter(id)`
   - `comparePricing(datacenterIds[])`
   - `calculateCustomScenario(services, datacenter)`

### Phase 3: UI Components
1. **Pricing Card** (datacenter tooltip/modal)
   - Show baseline monthly cost
   - Breakdown by service type
   - "Relative to cheapest: +15%"

2. **Cost Comparison Mode** (new feature)
   - Select 2-3 datacenters
   - Side-by-side cost comparison table
   - Visualize cost differences with bars/charts

3. **Simple Cost Calculator** (modal/drawer)
   - Sliders for: Compute instances, Storage TB, Transfer TB, Database instances
   - Real-time calculation across selected datacenter(s)
   - "Best Value" recommendation

4. **Map Overlay: Cost Heatmap** (optional advanced)
   - Color datacenters by cost (green=cheap, red=expensive)
   - Toggle between different service types

### Phase 4: Integration Points
- Add pricing to existing comparison modal
- Add cost filter to FilterBar ("Show only datacenters under $X/month")
- Add "Sort by Cost" option
- Update search to include pricing ("cheap datacenters", "under $500/month")

## MVP Scope (First Release)

**Included:**
- Static pricing data for AWS, GCP, Azure datacenters
- Baseline scenario: compute + storage + transfer + database
- Pricing shown in tooltips and comparison modal
- Simple cost calculator with sliders

**Excluded (Future):**
- Live API integration
- Spot/reserved pricing
- Detailed SKU selection
- Cost optimization recommendations
- Historical pricing trends

## Data Collection Script

Create `scripts/fetch-pricing-data.py`:
```python
# Fetch current pricing from provider calculators
# Output: lib/data/pricing.json
# Run monthly to keep data fresh
```

## Timeline Estimate
- Phase 1 (Data): 4-6 hours (manual research + JSON creation)
- Phase 2 (Backend): 2-3 hours
- Phase 3 (UI): 6-8 hours
- Phase 4 (Integration): 3-4 hours
- Testing & Polish: 2-3 hours

**Total: ~20-25 hours**

## Next Steps
1. ✅ Create this plan document
2. ⬜ Collect baseline pricing data for top 30 datacenters
3. ⬜ Create pricing.json schema and data file
4. ⬜ Implement backend pricing store and utilities
5. ⬜ Build UI components (start with simple pricing card)
6. ⬜ Integrate into existing features
7. ⬜ Test and refine
