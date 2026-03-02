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

// Validate that a JSON entry from providers.json satisfies ProviderMetadata.
// This guard is evaluated once at module load time and catches any mismatch
// between the JSON file and the interface without requiring an unsafe cast.
function isProviderMetadata(x: unknown): x is ProviderMetadata {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as Record<string, unknown>).id === 'string' &&
    typeof (x as Record<string, unknown>).name === 'string' &&
    typeof (x as Record<string, unknown>).fullName === 'string' &&
    typeof (x as Record<string, unknown>).type === 'string' &&
    typeof (x as Record<string, unknown>).color === 'string' &&
    typeof (x as Record<string, unknown>).textColor === 'string' &&
    typeof (x as Record<string, unknown>).website === 'string' &&
    ((x as Record<string, unknown>).logoUrl === null ||
      typeof (x as Record<string, unknown>).logoUrl === 'string')
  );
}

// Build a validated list once at module load time.
// Any entry that fails the shape check is skipped with a console warning
// rather than letting a bad cast propagate silently.
const validatedProviders: ProviderMetadata[] = (providersData as unknown[]).flatMap(
  (p): ProviderMetadata[] => {
    if (isProviderMetadata(p)) {
      return [p];
    }
    console.warn('[providerColors] Skipping malformed provider entry:', p);
    return [];
  }
);

// Create lookup map for fast access
const providerMap = new Map<string, ProviderMetadata>(
  validatedProviders.map((p) => [p.name.toLowerCase(), p])
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
 * Get all providers
 */
export function getAllProviders(): ProviderMetadata[] {
  return validatedProviders;
}
