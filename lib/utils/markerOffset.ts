import { Datacenter } from '@/types/datacenter';

function toCoordKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

/**
 * Calculate offset for overlapping datacenters
 * Returns array of datacenters with adjusted coordinates for display
 */
export function calculateMarkerOffsets(datacenters: Datacenter[]): Array<Datacenter & { offsetLat: number; offsetLng: number }> {
  // Group datacenters by exact coordinates
  const coordinateGroups = new Map<string, Datacenter[]>();

  datacenters.forEach(dc => {
    const key = toCoordKey(dc.lat, dc.lng); // Round to ~11m precision
    if (!coordinateGroups.has(key)) {
      coordinateGroups.set(key, []);
    }
    coordinateGroups.get(key)!.push(dc);
  });

  // Calculate offsets for overlapping markers
  const result: Array<Datacenter & { offsetLat: number; offsetLng: number }> = [];

  coordinateGroups.forEach((group) => {
    if (group.length === 1) {
      // Single datacenter at this location - no offset needed
      result.push({
        ...group[0],
        offsetLat: group[0].lat,
        offsetLng: group[0].lng
      });
    } else {
      // Multiple datacenters at same location - spread them in a circle
      const radius = 0.015; // ~1.7km offset radius
      const angleStep = (2 * Math.PI) / group.length;

      group.forEach((dc, index) => {
        const angle = index * angleStep;
        const offsetLat = dc.lat + radius * Math.sin(angle);
        const offsetLng = dc.lng + radius * Math.cos(angle);

        result.push({
          ...dc,
          offsetLat,
          offsetLng
        });
      });
    }
  });

  return result;
}

/**
 * Build a lookup map of colocation counts, keyed by coordinate.
 * O(n) to build, O(1) per lookup -- avoids O(n^2) when called per marker.
 */
export function buildColocatedCountMap(datacenters: Datacenter[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const dc of datacenters) {
    const key = toCoordKey(dc.lat, dc.lng);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/**
 * Look up the colocation count for a given coordinate from a precomputed map.
 */
export function getColocatedCount(countMap: Map<string, number>, lat: number, lng: number): number {
  return countMap.get(toCoordKey(lat, lng)) ?? 0;
}
