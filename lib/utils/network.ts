import type { 
  NetworkConnection, 
  ProviderBackbone, 
  NetworkConnectionType,
  ConnectionSpeed 
} from '@/types/network';
import type { Datacenter } from '@/types/datacenter';
import networkData from '@/lib/data/network-backbone.json';

/**
 * Get all network connections
 */
export function getAllConnections(): NetworkConnection[] {
  return networkData.connections as NetworkConnection[];
}

/**
 * Get connections for a specific provider
 */
export function getConnectionsByProvider(provider: string): NetworkConnection[] {
  return networkData.connections.filter(
    conn => conn.provider === provider
  ) as NetworkConnection[];
}

/**
 * Get connections by type
 */
export function getConnectionsByType(type: NetworkConnectionType): NetworkConnection[] {
  return networkData.connections.filter(
    conn => conn.connectionType === type
  ) as NetworkConnection[];
}

/**
 * Get connections involving a specific datacenter
 */
export function getConnectionsForDatacenter(datacenterId: string): NetworkConnection[] {
  return networkData.connections.filter(
    conn => conn.fromDatacenterId === datacenterId || conn.toDatacenterId === datacenterId
  ) as NetworkConnection[];
}

/**
 * Get provider backbone info
 */
export function getProviderBackbone(provider: string): ProviderBackbone | null {
  const backbone = networkData.providerBackbones.find(
    pb => pb.provider === provider
  );
  return backbone ? backbone as ProviderBackbone : null;
}

/**
 * Get all provider backbones
 */
export function getAllProviderBackbones(): ProviderBackbone[] {
  return networkData.providerBackbones as ProviderBackbone[];
}

/**
 * Check if two datacenters are directly connected
 */
export function areDatacentersConnected(dc1Id: string, dc2Id: string): NetworkConnection | null {
  const connection = networkData.connections.find(conn =>
    (conn.fromDatacenterId === dc1Id && conn.toDatacenterId === dc2Id) ||
    (conn.fromDatacenterId === dc2Id && conn.toDatacenterId === dc1Id)
  );
  return connection ? connection as NetworkConnection : null;
}

/**
 * Get color for connection type
 */
export function getConnectionColor(type: NetworkConnectionType): string {
  switch (type) {
    case 'backbone':
      return '#3b82f6'; // blue
    case 'peering':
      return '#10b981'; // green
    case 'transit':
      return '#f59e0b'; // amber
    case 'private-interconnect':
      return '#8b5cf6'; // purple
    default:
      return '#6b7280'; // gray
  }
}

/**
 * Get connection speed label
 */
export function getSpeedLabel(speed?: ConnectionSpeed): string {
  if (!speed) return '';
  return speed === 'multiple' ? 'Multi-Gig' : speed;
}

/**
 * Calculate network path between two datacenters (simple BFS)
 */
export function findNetworkPath(
  startId: string,
  endId: string,
  provider?: string
): NetworkConnection[] | null {
  const connections = provider 
    ? getConnectionsByProvider(provider)
    : getAllConnections();
  
  // Build adjacency list
  const graph = new Map<string, NetworkConnection[]>();
  connections.forEach(conn => {
    if (!graph.has(conn.fromDatacenterId)) {
      graph.set(conn.fromDatacenterId, []);
    }
    if (!graph.has(conn.toDatacenterId)) {
      graph.set(conn.toDatacenterId, []);
    }
    graph.get(conn.fromDatacenterId)!.push(conn);
    // Bidirectional
    const reverseConn = { ...conn, fromDatacenterId: conn.toDatacenterId, toDatacenterId: conn.fromDatacenterId };
    graph.get(conn.toDatacenterId)!.push(reverseConn);
  });
  
  // BFS to find path
  const queue: { id: string; path: NetworkConnection[] }[] = [{ id: startId, path: [] }];
  const visited = new Set<string>([startId]);
  
  while (queue.length > 0) {
    const { id, path } = queue.shift()!;
    
    if (id === endId) {
      return path;
    }
    
    const neighbors = graph.get(id) || [];
    for (const conn of neighbors) {
      const nextId = conn.toDatacenterId;
      if (!visited.has(nextId)) {
        visited.add(nextId);
        queue.push({ id: nextId, path: [...path, conn] });
      }
    }
  }
  
  return null; // No path found
}

/**
 * Get network statistics
 */
export function getNetworkStats() {
  const connections = getAllConnections();
  
  const byType = connections.reduce((acc, conn) => {
    acc[conn.connectionType] = (acc[conn.connectionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byProvider = connections.reduce((acc, conn) => {
    acc[conn.provider] = (acc[conn.provider] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const redundantCount = connections.filter(c => c.redundant).length;
  const activeCount = connections.filter(c => c.active).length;
  
  return {
    total: connections.length,
    byType,
    byProvider,
    redundant: redundantCount,
    active: activeCount,
    redundancyRate: Math.round((redundantCount / connections.length) * 100),
  };
}

/**
 * Format connection description
 */
export function formatConnectionDescription(
  connection: NetworkConnection,
  fromDc?: Datacenter,
  toDc?: Datacenter
): string {
  const from = fromDc?.metadata?.displayName || fromDc?.name || connection.fromDatacenterId;
  const to = toDc?.metadata?.displayName || toDc?.name || connection.toDatacenterId;
  const speed = getSpeedLabel(connection.speed);
  const type = connection.connectionType.replace('-', ' ');
  const redundant = connection.redundant ? 'Redundant' : 'Single-path';
  
  return `${from} ↔ ${to} | ${speed} ${type} (${redundant})`;
}
