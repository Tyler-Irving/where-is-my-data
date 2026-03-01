import { Datacenter, ProviderType } from '@/types/datacenter';

const DEFAULT_CAPACITY_RANGE: [number, number] = [0, 500];
const DEFAULT_PUE_RANGE: [number, number] = [1.0, 2.0];

interface FilterCriteria {
  providers: Set<string>;
  providerTypes: Set<ProviderType>;
  countries: Set<string>;
  capacityRange: [number, number];
  pueRange: [number, number];
  renewableOnly: boolean;
}

/**
 * Filter datacenters based on active filter criteria.
 * Shared across MapContainer, DatacenterMarkers, FilterBar, and ExportButton.
 */
export function filterDatacenters(datacenters: Datacenter[], filters: FilterCriteria): Datacenter[] {
  const { providers, providerTypes, countries, capacityRange, pueRange, renewableOnly } = filters;

  return datacenters.filter((dc) => {
    if (countries.size > 0 && !countries.has(dc.country ?? 'US')) return false;

    if (providers.size > 0 && !providers.has(dc.provider)) return false;

    if (providerTypes.size > 0) {
      const dcType = dc.metadata?.providerType;
      if (!dcType || !providerTypes.has(dcType)) return false;
    }

    const capacity = dc.metadata?.capacityMW;
    if (capacity !== undefined) {
      if (capacity < capacityRange[0] || capacity > capacityRange[1]) return false;
    } else if (capacityRange[0] !== DEFAULT_CAPACITY_RANGE[0] || capacityRange[1] !== DEFAULT_CAPACITY_RANGE[1]) {
      return false;
    }

    const pue = dc.metadata?.pue;
    if (pue !== undefined) {
      if (pue < pueRange[0] || pue > pueRange[1]) return false;
    } else if (pueRange[0] !== DEFAULT_PUE_RANGE[0] || pueRange[1] !== DEFAULT_PUE_RANGE[1]) {
      return false;
    }

    if (renewableOnly && !dc.metadata?.renewable) return false;

    return true;
  });
}
