export interface PricingData {
  lastUpdated: string;
  currency: string;
  baseline: {
    description: string;
    services: {
      compute: {
        description: string;
        aws_equivalent: string;
        gcp_equivalent: string;
        azure_equivalent: string;
      };
      storage: {
        description: string;
        size_tb: number;
      };
      dataTransfer: {
        description: string;
        size_tb: number;
      };
      database: {
        description: string;
        aws_equivalent: string;
        gcp_equivalent: string;
        azure_equivalent: string;
      };
    };
  };
  datacenters: DatacenterPricing[];
  summary: {
    cheapest: {
      datacenterId: string;
      totalMonthly: number;
    };
    mostExpensive: {
      datacenterId: string;
      totalMonthly: number;
    };
    averageMonthly: number;
    notes: string;
  };
}

export interface DatacenterPricing {
  datacenterId: string;
  provider: string;
  region: string;
  displayName: string;
  pricing: {
    compute: {
      pricePerHour: number;
      pricePerMonth: number;
    };
    storage: {
      pricePerGbMonth: number;
      baseline1TbMonth: number;
    };
    dataTransfer: {
      egressPricePerGb: number;
      baseline10TbMonth: number;
    };
    database: {
      pricePerHour: number;
      pricePerMonth: number;
    };
  };
  totalBaselineMonthly: number;
  notes?: string;
}

export interface CustomScenario {
  computeInstances: number;
  storageTb: number;
  dataTransferTb: number;
  databaseInstances: number;
}

export interface ScenarioEstimate {
  datacenterId: string;
  displayName: string;
  provider: string;
  breakdown: {
    compute: number;
    storage: number;
    dataTransfer: number;
    database: number;
  };
  total: number;
  relativeToMin?: string;  // e.g., "+15%"
}
