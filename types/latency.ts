export interface LatencyEstimate {
  fromDatacenterId: string;
  toDatacenterId: string;
  fromDisplayName: string;
  toDisplayName: string;
  distanceKm: number;
  distanceMiles: number;
  estimatedLatencyMs: number;
  category: 'excellent' | 'good' | 'acceptable' | 'high';
  notes?: string;
}

export interface LatencyRoute {
  from: {
    lat: number;
    lng: number;
    name: string;
  };
  to: {
    lat: number;
    lng: number;
    name: string;
  };
  latencyMs: number;
  color: string;
}

export interface MultiRegionLatency {
  datacenters: {
    id: string;
    name: string;
  }[];
  averageLatency: number;
  maxLatency: number;
  pairwiseLatencies: LatencyEstimate[];
}
