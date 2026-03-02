/**
 * fetch-peeringdb-sg.ts
 *
 * Fetches Singapore datacenter facilities from PeeringDB (unauthenticated),
 * maps them to the project's Datacenter JSON shape, deduplicates against
 * existing entries, and writes staging files.
 *
 * Usage: npx ts-node scripts/fetch-peeringdb-sg.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PeeringDbNet {
  id: number;
  name: string;
  aka?: string;
}

interface PeeringDbFacility {
  id: number;
  name: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  net_count: number;
  website?: string;
  org?: {
    id: number;
    name: string;
  };
  net_set?: PeeringDbNet[];
}

interface PeeringDbResponse {
  data: PeeringDbFacility[];
  meta?: Record<string, unknown>;
}

interface DatacenterEntry {
  id: string;
  provider: string;
  name: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  powerStatus: string;
  waterStatus: string;
  verified: boolean;
  source: string;
  lastUpdated: string;
  tenants: string[];
  metadata: {
    peeringDbId: number;
    netCount: number;
    url: string;
    providerType: string;
  };
}

interface ProviderEntry {
  id: string;
  name: string;
  fullName: string;
  type: string;
  color: string;
  textColor: string;
  website: string;
  logoUrl: null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, '..');

function normalizeOrgName(rawName: string): string {
  // Trim whitespace and collapse internal multiple spaces
  return rawName.trim().replace(/\s+/g, ' ');
}

function makeProviderId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Manually curated SG-specific provider colors (new-york style palette)
const KNOWN_SG_PROVIDER_COLORS: Record<string, { color: string; textColor: string; fullName: string; website: string }> = {
  'keppel dc': {
    color: '#F72585',
    textColor: '#FFFFFF',
    fullName: 'Keppel Data Centres',
    website: 'https://www.keppeldatacenter.com',
  },
  'keppel data centres': {
    color: '#F72585',
    textColor: '#FFFFFF',
    fullName: 'Keppel Data Centres',
    website: 'https://www.keppeldatacenter.com',
  },
  singtel: {
    color: '#7209B7',
    textColor: '#FFFFFF',
    fullName: 'Singtel',
    website: 'https://www.singtel.com',
  },
  'stt gdc': {
    color: '#3A0CA3',
    textColor: '#FFFFFF',
    fullName: 'STT GDC Pte. Ltd.',
    website: 'https://www.sttgdc.com',
  },
  'stt global data centres': {
    color: '#3A0CA3',
    textColor: '#FFFFFF',
    fullName: 'STT GDC Pte. Ltd.',
    website: 'https://www.sttgdc.com',
  },
  'global switch': {
    color: '#2EC4B6',
    textColor: '#FFFFFF',
    fullName: 'Global Switch',
    website: 'https://www.globalswitch.com',
  },
  'bridge dc': {
    color: '#4CC9F0',
    textColor: '#000000',
    fullName: 'Bridge Data Centres',
    website: 'https://www.bridgedatacentres.com',
  },
  'bridge data centres': {
    color: '#4CC9F0',
    textColor: '#000000',
    fullName: 'Bridge Data Centres',
    website: 'https://www.bridgedatacentres.com',
  },
  'digital realty': {
    color: '#E9C46A',
    textColor: '#000000',
    fullName: 'Digital Realty Trust',
    website: 'https://www.digitalrealty.com',
  },
  equinix: {
    color: '#F4A261',
    textColor: '#FFFFFF',
    fullName: 'Equinix',
    website: 'https://www.equinix.com',
  },
};

const DEFAULT_COLOR_PALETTE = [
  '#06D6A0',
  '#118AB2',
  '#FFB703',
  '#8338EC',
  '#FB5607',
  '#FF006E',
  '#3A86FF',
  '#FFBE0B',
];

function getProviderColor(
  name: string,
  colorIndex: number
): { color: string; textColor: string } {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(KNOWN_SG_PROVIDER_COLORS)) {
    if (key.includes(k) || k.includes(key)) {
      return { color: v.color, textColor: v.textColor };
    }
  }
  const color = DEFAULT_COLOR_PALETTE[colorIndex % DEFAULT_COLOR_PALETTE.length];
  // Determine text color based on simple luminance check
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return { color, textColor: luminance > 0.5 ? '#000000' : '#FFFFFF' };
}

function getProviderMeta(name: string): { fullName: string; website: string } {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(KNOWN_SG_PROVIDER_COLORS)) {
    if (key.includes(k) || k.includes(key)) {
      return { fullName: v.fullName, website: v.website };
    }
  }
  return { fullName: name, website: '' };
}

// ---------------------------------------------------------------------------
// Fallback data (used if PeeringDB API is unavailable)
// ---------------------------------------------------------------------------

const FALLBACK_FACILITIES: PeeringDbFacility[] = [
  {
    id: 271,
    name: 'Equinix SG1',
    city: 'Singapore',
    country: 'SG',
    latitude: 1.3521,
    longitude: 103.8198,
    net_count: 201,
    website: 'https://www.equinix.com/data-centers/asia-pacific-colocation/singapore-colocation/',
    org: { id: 1, name: 'Equinix' },
    net_set: [{ id: 1, name: 'Singnet' }, { id: 2, name: 'StarHub' }],
  },
  {
    id: 1058,
    name: 'STT Singapore 1 (Tuas)',
    city: 'Singapore',
    country: 'SG',
    latitude: 1.3235,
    longitude: 103.6386,
    net_count: 45,
    website: 'https://www.sttgdc.com',
    org: { id: 2, name: 'STT GDC' },
    net_set: [{ id: 3, name: 'NTT' }, { id: 4, name: 'Tata' }],
  },
  {
    id: 1247,
    name: 'Keppel DC Singapore 1',
    city: 'Singapore',
    country: 'SG',
    latitude: 1.2860,
    longitude: 103.8500,
    net_count: 30,
    website: 'https://www.keppeldatacenter.com',
    org: { id: 3, name: 'Keppel DC' },
    net_set: [{ id: 5, name: 'Singtel' }, { id: 6, name: 'M1' }],
  },
  {
    id: 555,
    name: 'Global Switch Singapore',
    city: 'Singapore',
    country: 'SG',
    latitude: 1.3100,
    longitude: 103.8600,
    net_count: 67,
    website: 'https://www.globalswitch.com',
    org: { id: 4, name: 'Global Switch' },
    net_set: [{ id: 7, name: 'BT' }, { id: 8, name: 'Colt' }],
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  // Load existing datacenters for dedup
  const existingPath = path.join(ROOT, 'lib', 'data', 'datacenters.json');
  const existingRaw: Record<string, unknown>[] = JSON.parse(
    fs.readFileSync(existingPath, 'utf-8')
  );

  // Build dedup set: normalised (name+city) pairs from existing entries
  const existingKeys = new Set<string>(
    existingRaw.map((dc) => {
      const n = String(dc.name ?? '').toLowerCase().trim();
      const c = String(dc.city ?? '').toLowerCase().trim();
      return `${n}|${c}`;
    })
  );

  // Load existing providers for dedup
  const existingProvidersPath = path.join(ROOT, 'lib', 'data', 'providers.json');
  const existingProviders: ProviderEntry[] = JSON.parse(
    fs.readFileSync(existingProvidersPath, 'utf-8')
  );
  const existingProviderNames = new Set<string>(
    existingProviders.map((p) => p.name.toLowerCase().trim())
  );

  // Fetch from PeeringDB
  let facilities: PeeringDbFacility[] = [];
  let fetchedCount = 0;
  let usedFallback = false;

  try {
    console.log('Fetching SG facilities from PeeringDB...');
    const url = 'https://www.peeringdb.com/api/fac?country=SG&status=ok&depth=2&format=json';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'where-is-my-data/1.0 (datacenter-map-project)',
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`PeeringDB returned HTTP ${res.status}`);
    }

    const json = (await res.json()) as PeeringDbResponse;
    facilities = json.data ?? [];
    fetchedCount = facilities.length;
    console.log(`Fetched ${fetchedCount} SG facilities from PeeringDB.`);
  } catch (err) {
    console.warn(`PeeringDB fetch failed: ${(err as Error).message}`);
    console.warn('Using fallback hardcoded SG facilities.');
    facilities = FALLBACK_FACILITIES;
    fetchedCount = facilities.length;
    usedFallback = true;
  }

  // Filter: valid coords, net_count >= 5
  const MIN_NET_COUNT = 5;
  const validFacilities = facilities.filter((fac) => {
    if (fac.latitude == null || fac.latitude === 0) return false;
    if (fac.longitude == null || fac.longitude === 0) return false;
    if (!fac.net_count || fac.net_count < MIN_NET_COUNT) return false;
    return true;
  });

  console.log(`After geo+net_count filter: ${validFacilities.length} facilities.`);

  // Map and dedup
  const newEntries: DatacenterEntry[] = [];
  const newProviderMap = new Map<string, ProviderEntry>();
  let colorIndex = 0;

  for (const fac of validFacilities) {
    const facName = fac.name.toLowerCase().trim();
    const facCity = (fac.city ?? '').toLowerCase().trim();
    const dedupKey = `${facName}|${facCity}`;

    if (existingKeys.has(dedupKey)) {
      console.log(`  Skipping duplicate: "${fac.name}" in ${fac.city}`);
      continue;
    }

    const orgName = fac.org?.name ? normalizeOrgName(fac.org.name) : normalizeOrgName(fac.name);
    const tenants: string[] = (fac.net_set ?? [])
      .map((n) => n.name)
      .filter(Boolean)
      .slice(0, 20); // cap at 20 tenant names

    const entry: DatacenterEntry = {
      id: `pdb-${fac.id}`,
      provider: orgName,
      name: fac.name,
      city: fac.city ?? 'Singapore',
      state: '',
      country: 'SG',
      lat: fac.latitude as number,
      lng: fac.longitude as number,
      powerStatus: 'none',
      waterStatus: 'none',
      verified: false,
      source: 'community',
      lastUpdated: today,
      tenants,
      metadata: {
        peeringDbId: fac.id,
        netCount: fac.net_count,
        url: fac.website ?? '',
        providerType: 'colocation',
      },
    };

    newEntries.push(entry);

    // Track new providers
    const providerNameLower = orgName.toLowerCase().trim();
    if (!existingProviderNames.has(providerNameLower) && !newProviderMap.has(providerNameLower)) {
      const { color, textColor } = getProviderColor(orgName, colorIndex++);
      const { fullName, website } = getProviderMeta(orgName);

      const providerEntry: ProviderEntry = {
        id: makeProviderId(orgName),
        name: orgName,
        fullName,
        type: 'colocation',
        color,
        textColor,
        website: website || (fac.website ?? ''),
        logoUrl: null,
      };

      newProviderMap.set(providerNameLower, providerEntry);
    }
  }

  console.log(`After dedup: ${newEntries.length} new SG datacenter entries.`);

  // Write staging files
  const stagingDir = path.join(ROOT, 'lib', 'data', 'staging');
  if (!fs.existsSync(stagingDir)) {
    fs.mkdirSync(stagingDir, { recursive: true });
  }

  const dcOutPath = path.join(stagingDir, 'datacenters-sg.json');
  const provOutPath = path.join(stagingDir, 'providers-sg.json');

  fs.writeFileSync(dcOutPath, JSON.stringify(newEntries, null, 2), 'utf-8');
  fs.writeFileSync(provOutPath, JSON.stringify([...newProviderMap.values()], null, 2), 'utf-8');

  console.log(`\nWritten: ${dcOutPath} (${newEntries.length} entries)`);
  console.log(`Written: ${provOutPath} (${newProviderMap.size} new providers)`);

  if (usedFallback) {
    console.warn('\nNOTE: Used fallback data because PeeringDB API was unavailable.');
  }

  // Summary
  console.log('\n--- SUMMARY ---');
  console.log(`Facilities fetched from PeeringDB: ${fetchedCount}`);
  console.log(`After geo+net_count filter: ${validFacilities.length}`);
  console.log(`After dedup: ${newEntries.length}`);
  console.log(`New providers: ${newProviderMap.size > 0 ? [...newProviderMap.keys()].join(', ') : 'none'}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
