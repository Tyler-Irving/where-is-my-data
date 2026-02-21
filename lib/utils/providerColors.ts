import providersData from '@/lib/data/providers.json';
import { ProviderType } from '@/types/datacenter';

interface ProviderMetadata {
  id: string;
  name: string;
  fullName: string;
  type: string;
  color: string;
  textColor: string;
  website: string;
  logoUrl: string | null;
}

// Human-readable labels for provider types
export const PROVIDER_TYPE_LABELS: Record<ProviderType, string> = {
  'hyperscale-cloud': 'Hyperscale Cloud',
  'tech-giant': 'Tech Giants',
  'colocation': 'Colocation',
  'regional-cloud': 'Regional Cloud',
  'edge-cdn': 'Edge/CDN',
};

// Create lookup map for fast access
const providerMap = new Map<string, ProviderMetadata>(
  providersData.map((p) => [p.name.toLowerCase(), p as ProviderMetadata])
);

/**
 * Get provider metadata by name
 */
export function getProviderMetadata(providerName: string): ProviderMetadata | null {
  return providerMap.get(providerName.toLowerCase()) || null;
}

/**
 * Get provider color (hex code)
 */
export function getProviderColor(providerName: string): string {
  const provider = getProviderMetadata(providerName);
  return provider?.color || '#6B7280'; // Default gray-500 if not found
}

/**
 * Get provider text color (for contrast)
 */
export function getProviderTextColor(providerName: string): string {
  const provider = getProviderMetadata(providerName);
  return provider?.textColor || '#FFFFFF';
}

/**
 * Get all providers by type
 */
export function getProvidersByType(type: string): ProviderMetadata[] {
  return providersData.filter((p) => p.type === type) as ProviderMetadata[];
}

/**
 * Get all unique provider types
 */
export function getAllProviderTypes(): string[] {
  return Array.from(new Set(providersData.map((p) => p.type)));
}

/**
 * Get all providers
 */
export function getAllProviders(): ProviderMetadata[] {
  return providersData as ProviderMetadata[];
}
