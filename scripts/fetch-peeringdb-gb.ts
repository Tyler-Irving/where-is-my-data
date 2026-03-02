/**
 * fetch-peeringdb-gb.ts
 *
 * Fetches UK (GB) datacenters from the PeeringDB public API (no auth required)
 * and writes staging files for the where-is-my-data project.
 *
 * Output:
 *   lib/data/staging/datacenters-gb.json   — new GB datacenter entries
 *   lib/data/staging/providers-gb.json     — new provider entries not in providers.json
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types (minimal, matching PeeringDB API response shape)
// ---------------------------------------------------------------------------

interface PdbNet {
  id: number;
  name: string;
}

interface PdbFacility {
  id: number;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  net_count: number;
  website: string;
  org: { id: number; name: string } | null;
  net_set: PdbNet[];
}

interface PdbApiResponse {
  data: PdbFacility[];
}

// ---------------------------------------------------------------------------
// Existing data (for deduplication)
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, '..');

interface ExistingDC {
  id: string;
  name: string;
  city?: string;
  metadata?: { peeringDbId?: number };
}

interface ExistingProvider {
  id: string;
  name: string;
}

const existingDCs: ExistingDC[] = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'lib/data/datacenters.json'), 'utf-8')
);

const existingProviders: ExistingProvider[] = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'lib/data/providers.json'), 'utf-8')
);

// Build lookup sets for fast dedup checks
const existingPdbIds = new Set<number>(
  existingDCs
    .map((dc) => dc.metadata?.peeringDbId)
    .filter((id): id is number => id !== undefined)
);

const existingNameCity = new Set<string>(
  existingDCs.map((dc) => `${(dc.name ?? '').toLowerCase()}|${(dc.city ?? '').toLowerCase()}`)
);

const existingProviderNames = new Set<string>(
  existingProviders.map((p) => p.name.toLowerCase())
);

// ---------------------------------------------------------------------------
// Provider color map (assign distinct colors to known GB providers)
// ---------------------------------------------------------------------------

const GB_PROVIDER_COLORS: Record<string, { color: string; textColor: string; fullName: string; website: string; type: string }> = {
  telehouse:       { color: '#E63946', textColor: '#FFFFFF', fullName: 'Telehouse Europe',           website: 'https://www.telehouse.net',          type: 'colocation' },
  'global switch': { color: '#2EC4B6', textColor: '#FFFFFF', fullName: 'Global Switch',              website: 'https://www.globalswitch.com',        type: 'colocation' },
  cyrusone:        { color: '#264653', textColor: '#FFFFFF', fullName: 'CyrusOne',                   website: 'https://cyrusone.com',                type: 'colocation' },
  'vantage dc':    { color: '#A8DADC', textColor: '#000000', fullName: 'Vantage Data Centers',       website: 'https://vantagedc.com',               type: 'colocation' },
  'digital realty':{ color: '#E9C46A', textColor: '#000000', fullName: 'Digital Realty Trust',       website: 'https://www.digitalrealty.com',       type: 'colocation' },
  iomart:          { color: '#5C4033', textColor: '#FFFFFF', fullName: 'iomart Group',               website: 'https://www.iomart.com',              type: 'colocation' },
  colt:            { color: '#003366', textColor: '#FFFFFF', fullName: 'Colt Data Centre Services',  website: 'https://www.colt.net',                type: 'colocation' },
  'interxion':     { color: '#FF6B35', textColor: '#FFFFFF', fullName: 'Interxion (Digital Realty)', website: 'https://www.interxion.com',           type: 'colocation' },
  'ark dc':        { color: '#4A4E69', textColor: '#FFFFFF', fullName: 'Ark Data Centres',           website: 'https://www.arkdatacentres.co.uk',    type: 'colocation' },
  'pulsant':       { color: '#6A994E', textColor: '#FFFFFF', fullName: 'Pulsant',                    website: 'https://www.pulsant.com',             type: 'colocation' },
  'volterra':      { color: '#7209B7', textColor: '#FFFFFF', fullName: 'Volterra',                   website: 'https://www.volterra.io',             type: 'regional-cloud' },
  'sungard':       { color: '#F77F00', textColor: '#FFFFFF', fullName: 'Sungard AS',                 website: 'https://www.sungardas.com',           type: 'colocation' },
  'virtus':        { color: '#1B4332', textColor: '#FFFFFF', fullName: 'Virtus Data Centres',        website: 'https://www.virtus.com',              type: 'colocation' },
  'ukcloud':       { color: '#0096C7', textColor: '#FFFFFF', fullName: 'UKCloud',                    website: 'https://ukcloud.com',                 type: 'regional-cloud' },
  'datum':         { color: '#B5838D', textColor: '#FFFFFF', fullName: 'Datum Datacentres',          website: 'https://www.datum.co.uk',             type: 'colocation' },
};

// Fallback palette for unknown providers
const FALLBACK_COLORS = [
  '#457B9D', '#1D3557', '#A8DADC', '#E63946', '#2EC4B6',
  '#E9C46A', '#F4A261', '#264653', '#6D6875', '#B7B7A4',
];
let fallbackColorIdx = 0;

function assignColor(providerName: string): { color: string; textColor: string } {
  const key = providerName.toLowerCase();
  for (const [match, vals] of Object.entries(GB_PROVIDER_COLORS)) {
    if (key.includes(match)) return { color: vals.color, textColor: vals.textColor };
  }
  const color = FALLBACK_COLORS[fallbackColorIdx % FALLBACK_COLORS.length];
  fallbackColorIdx++;
  return { color, textColor: '#FFFFFF' };
}

function resolveProviderMeta(providerName: string): { fullName: string; website: string; type: string } {
  const key = providerName.toLowerCase();
  for (const [match, vals] of Object.entries(GB_PROVIDER_COLORS)) {
    if (key.includes(match)) return { fullName: vals.fullName, website: vals.website, type: vals.type };
  }
  return { fullName: providerName, website: '', type: 'colocation' };
}

// ---------------------------------------------------------------------------
// ID helpers
// ---------------------------------------------------------------------------

function toProviderId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---------------------------------------------------------------------------
// Manual fallback data (used if API fails)
// ---------------------------------------------------------------------------

function buildManualFallback(): PdbFacility[] {
  return [
    {
      id: 14,
      name: 'Telehouse - London (Docklands North)',
      city: 'London',
      state: 'England',
      country: 'GB',
      latitude: 51.5081,
      longitude: -0.0153,
      net_count: 530,
      website: 'https://www.telehouse.net',
      org: { id: 101, name: 'Telehouse' },
      net_set: [
        { id: 1, name: 'BT' },
        { id: 2, name: 'NTT' },
        { id: 3, name: 'Telia' },
      ],
    },
    {
      id: 246,
      name: 'Global Switch London East',
      city: 'London',
      state: 'England',
      country: 'GB',
      latitude: 51.5209,
      longitude: -0.0629,
      net_count: 320,
      website: 'https://www.globalswitch.com',
      org: { id: 102, name: 'Global Switch' },
      net_set: [
        { id: 4, name: 'Cogent' },
        { id: 5, name: 'GTT' },
      ],
    },
    {
      id: 114,
      name: 'Equinix LD4 - London, Slough',
      city: 'Slough',
      state: 'England',
      country: 'GB',
      latitude: 51.5231,
      longitude: -0.6028,
      net_count: 450,
      website: 'https://www.equinix.com',
      org: { id: 103, name: 'Equinix' },
      net_set: [
        { id: 6, name: 'Limelight' },
        { id: 7, name: 'Zayo' },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const TODAY = new Date().toISOString().slice(0, 10);
  const STAGING_DIR = path.join(ROOT, 'lib/data/staging');

  // Ensure staging dir exists
  if (!fs.existsSync(STAGING_DIR)) {
    fs.mkdirSync(STAGING_DIR, { recursive: true });
  }

  // ---- Step 1: Fetch from PeeringDB ----
  let facilities: PdbFacility[] = [];
  let usedFallback = false;

  try {
    console.log('Fetching GB facilities from PeeringDB...');
    const url = 'https://www.peeringdb.com/api/fac?country=GB&status=ok&depth=2&format=json';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'where-is-my-data/1.0 (data visualization project)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const body = await res.json() as PdbApiResponse;
    facilities = body.data ?? [];
    console.log(`  Fetched ${facilities.length} raw facilities from PeeringDB`);
  } catch (err) {
    console.error(`PeeringDB fetch failed: ${err}`);
    console.warn('Falling back to manual dataset...');
    facilities = buildManualFallback();
    usedFallback = true;
  }

  // ---- Step 2: Filter ----
  const filtered = facilities.filter((f) => {
    if (f.latitude === null || f.latitude === 0) return false;
    if (f.longitude === null || f.longitude === 0) return false;
    if (!f.net_count || f.net_count < 5) return false;
    return true;
  });
  console.log(`  After filtering (valid coords + net_count >= 5): ${filtered.length}`);

  // ---- Step 3: Deduplicate against existing data ----
  const deduped = filtered.filter((f) => {
    // Skip if peeringDbId already in dataset
    if (existingPdbIds.has(f.id)) return false;
    // Skip if name+city combo already exists
    const key = `${f.name.toLowerCase()}|${f.city.toLowerCase()}`;
    if (existingNameCity.has(key)) return false;
    return true;
  });
  console.log(`  After dedup against existing entries: ${deduped.length}`);

  // ---- Step 4: Map to datacenter shape ----
  const newDCs = deduped.map((f) => {
    const orgName = f.org?.name ?? f.name.split(' - ')[0] ?? 'Unknown';
    const tenants = (f.net_set ?? []).map((n) => n.name).filter(Boolean);

    return {
      id: `pdb-${f.id}`,
      provider: orgName,
      providerType: 'colocation' as const,
      name: f.name,
      displayName: f.name,
      city: f.city,
      state: f.state ?? '',
      country: 'GB',
      lat: f.latitude as number,
      lng: f.longitude as number,
      powerStatus: 'none',
      waterStatus: 'none',
      verified: false,
      source: 'community',
      lastUpdated: TODAY,
      tenants,
      metadata: {
        peeringDbId: f.id,
        netCount: f.net_count,
        url: f.website ?? '',
        providerType: 'colocation',
      },
    };
  });

  // ---- Step 5: Collect new providers ----
  const seenNewProviders = new Map<string, { id: string; name: string; fullName: string; type: string; color: string; textColor: string; website: string; logoUrl: null }>();

  for (const dc of newDCs) {
    const name = dc.provider;
    const nameLower = name.toLowerCase();
    if (!existingProviderNames.has(nameLower) && !seenNewProviders.has(nameLower)) {
      const id = toProviderId(name);
      const colors = assignColor(name);
      const meta = resolveProviderMeta(name);
      seenNewProviders.set(nameLower, {
        id,
        name,
        fullName: meta.fullName,
        type: meta.type,
        color: colors.color,
        textColor: colors.textColor,
        website: meta.website,
        logoUrl: null,
      });
    }
  }

  const newProviders = Array.from(seenNewProviders.values());

  // ---- Step 6: Write output files ----
  const dcOutPath = path.join(STAGING_DIR, 'datacenters-gb.json');
  const provOutPath = path.join(STAGING_DIR, 'providers-gb.json');

  fs.writeFileSync(dcOutPath, JSON.stringify(newDCs, null, 2), 'utf-8');
  fs.writeFileSync(provOutPath, JSON.stringify(newProviders, null, 2), 'utf-8');

  // ---- Summary ----
  console.log('\n--- Summary ---');
  console.log(`Facilities fetched (raw):       ${facilities.length}${usedFallback ? ' (manual fallback)' : ''}`);
  console.log(`After filtering:                ${filtered.length}`);
  console.log(`After dedup:                    ${deduped.length}`);
  console.log(`New providers added:            ${newProviders.length > 0 ? newProviders.map((p) => p.name).join(', ') : 'none'}`);
  console.log(`Written: ${dcOutPath}`);
  console.log(`Written: ${provOutPath}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
