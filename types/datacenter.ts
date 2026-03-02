// Datacenter type definitions

export type IssueStatus = 'none' | 'low' | 'medium' | 'high' | 'critical';

export type ProviderType = 'hyperscale-cloud' | 'colocation' | 'tech-giant' | 'regional-cloud' | 'edge-cdn';

export interface Datacenter {
  id: string;
  name: string;
  provider: string;
  lat: number;
  lng: number;
  city?: string;
  state: string;
  country?: string;
  tenants?: string[];       // network names present in the facility (from PeeringDB)
  powerStatus: IssueStatus;
  waterStatus: IssueStatus;
  verified: boolean;
  source: 'official' | 'community' | 'estimated';
  lastUpdated: string;
  metadata?: {
    // Core metadata
    url?: string;
    providerType?: ProviderType;
    displayName?: string;
    region?: string;
    opened?: number;
    capacityMW?: number;
    renewable?: boolean;
    pue?: number;
    certifications?: string[];
    availabilityZones?: number;
    
    // Additional fields
    statusDashboard?: string;
    statusPage?: string;
    notes?: string;
    type?: string;
    sqft?: number;
    
    // PeeringDB fields
    peeringDbId?: number;
    netCount?: number;
    ixCount?: number;
    carrierCount?: number;
    clli?: string;
    address1?: string;
    address2?: string;
    zipcode?: string;
    aka?: string;
    npanxx?: string;
  };
}
