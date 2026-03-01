import type { LatencyEstimate, LatencyRoute, MultiRegionLatency } from '@/types/latency';
import type { Datacenter } from '@/types/datacenter';

/**
 * Calculate geographic distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimate network latency based on distance
 * 
 * Formula:
 * - Base latency: distance / speed of light in fiber (~200,000 km/s = ~5 µs/km)
 * - Fiber follows roads/cables, not straight line: multiply by ~1.3x
 * - Router hops: ~0.5ms per hop, estimate 1 hop per 500km
 * - Network congestion buffer: add 10-20% for real-world conditions
 */
export function estimateLatency(distanceKm: number): number {
  // Speed of light in fiber: ~200,000 km/s or ~5 microseconds per km
  const baseLatencyMs = (distanceKm * 5) / 1000; // Convert µs to ms
  
  // Fiber routing overhead (cables follow roads, not straight lines)
  const routingOverhead = 1.3;
  
  // Router hop delay (estimate 1 hop per 500km, ~0.5ms per hop)
  const hops = Math.ceil(distanceKm / 500);
  const hopLatencyMs = hops * 0.5;
  
  // Total one-way latency
  const oneWayLatency = (baseLatencyMs * routingOverhead) + hopLatencyMs;
  
  // Network congestion buffer (15% typical)
  const congestionBuffer = 1.15;
  
  // Round-trip time (RTT)
  const rtt = oneWayLatency * 2 * congestionBuffer;
  
  return Math.round(rtt * 10) / 10; // Round to 1 decimal place
}

/**
 * Get latency category based on milliseconds
 */
export function getLatencyCategory(latencyMs: number): LatencyEstimate['category'] {
  if (latencyMs < 10) return 'excellent';
  if (latencyMs < 30) return 'good';
  if (latencyMs < 60) return 'acceptable';
  return 'high';
}

/**
 * Get color for latency visualization
 */
export function getLatencyColor(latencyMs: number): string {
  if (latencyMs < 10) return '#10b981'; // green
  if (latencyMs < 30) return '#3b82f6'; // blue
  if (latencyMs < 60) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

/**
 * Calculate latency between two datacenters
 */
export function calculateLatencyBetween(
  dc1: Datacenter,
  dc2: Datacenter
): LatencyEstimate {
  const distanceKm = calculateDistance(dc1.lat, dc1.lng, dc2.lat, dc2.lng);
  const distanceMiles = distanceKm * 0.621371;
  const estimatedLatencyMs = estimateLatency(distanceKm);
  const category = getLatencyCategory(estimatedLatencyMs);
  
  return {
    fromDatacenterId: dc1.id,
    toDatacenterId: dc2.id,
    fromDisplayName: dc1.metadata?.displayName || dc1.name,
    toDisplayName: dc2.metadata?.displayName || dc2.name,
    distanceKm: Math.round(distanceKm),
    distanceMiles: Math.round(distanceMiles),
    estimatedLatencyMs,
    category,
    notes: getCategoryNotes(category),
  };
}

/**
 * Get descriptive notes for latency category
 */
function getCategoryNotes(category: LatencyEstimate['category']): string {
  switch (category) {
    case 'excellent':
      return 'Ideal for real-time applications and low-latency workloads';
    case 'good':
      return 'Suitable for most interactive applications';
    case 'acceptable':
      return 'May have noticeable lag for interactive applications';
    case 'high':
      return 'High latency - consider using closer regions';
  }
}

/**
 * Create a latency route for map visualization
 */
export function createLatencyRoute(
  dc1: Datacenter,
  dc2: Datacenter,
  estimate: LatencyEstimate
): LatencyRoute {
  return {
    from: {
      lat: dc1.lat,
      lng: dc1.lng,
      name: dc1.metadata?.displayName || dc1.name,
    },
    to: {
      lat: dc2.lat,
      lng: dc2.lng,
      name: dc2.metadata?.displayName || dc2.name,
    },
    latencyMs: estimate.estimatedLatencyMs,
    color: getLatencyColor(estimate.estimatedLatencyMs),
  };
}

/**
 * Calculate multi-region latency statistics
 */
export function calculateMultiRegionLatency(
  datacenters: Datacenter[]
): MultiRegionLatency {
  if (datacenters.length < 2) {
    throw new Error('At least 2 datacenters required for multi-region latency');
  }
  
  const pairwiseLatencies: LatencyEstimate[] = [];
  
  // Calculate latency between all pairs
  for (let i = 0; i < datacenters.length; i++) {
    for (let j = i + 1; j < datacenters.length; j++) {
      const estimate = calculateLatencyBetween(datacenters[i], datacenters[j]);
      pairwiseLatencies.push(estimate);
    }
  }
  
  const latencies = pairwiseLatencies.map(l => l.estimatedLatencyMs);
  const averageLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
  const maxLatency = Math.max(...latencies);
  
  return {
    datacenters: datacenters.map(dc => ({
      id: dc.id,
      name: dc.metadata?.displayName || dc.name,
    })),
    averageLatency: Math.round(averageLatency * 10) / 10,
    maxLatency: Math.round(maxLatency * 10) / 10,
    pairwiseLatencies,
  };
}

/**
 * Format latency for display
 */
export function formatLatency(latencyMs: number): string {
  if (latencyMs < 1) return '<1 ms';
  return `${latencyMs.toFixed(1)} ms`;
}
