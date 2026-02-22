export type NetworkConnectionType = 
  | 'backbone' 
  | 'peering' 
  | 'transit' 
  | 'private-interconnect';

export type ConnectionSpeed = 
  | '1G' 
  | '10G' 
  | '40G' 
  | '100G' 
  | '400G' 
  | 'multiple';

export interface NetworkConnection {
  id: string;
  fromDatacenterId: string;
  toDatacenterId: string;
  provider: string;
  connectionType: NetworkConnectionType;
  speed?: ConnectionSpeed;
  redundant: boolean;
  active: boolean;
  notes?: string;
}

export interface ProviderBackbone {
  provider: string;
  connections: NetworkConnection[];
  totalCapacity: string;
  regions: string[];
  description: string;
}

export interface PeeringRelationship {
  datacenter1: string;
  datacenter2: string;
  peeringType: 'public' | 'private';
  exchangePoint?: string;
  asn1?: number;
  asn2?: number;
}

export interface NetworkVisualization {
  connections: NetworkConnection[];
  activeProviders: string[];
  connectionTypes: NetworkConnectionType[];
  showLabels: boolean;
  animate: boolean;
}
