#!/usr/bin/env node
/**
 * scripts/sync-peeringdb.mjs
 *
 * Syncs PeeringDB facility data into lib/data/datacenters.json.
 *
 * What it does:
 *   1. Fetches all US facilities from PeeringDB (paginated)
 *   2. Matches existing colocation/tech-giant DCs by city + name similarity
 *   3. Enriches matched DCs with: peeringDbId, netCount, ixCount, carrierCount,
 *      address1, address2, zipcode, clli
 *   4. Adds new notable facilities (net_count >= NET_COUNT_THRESHOLD) as new entries
 *   5. Writes updated lib/data/datacenters.json
 *
 * Usage:
 *   node scripts/sync-peeringdb.mjs
 *
 * Requires PEERING_DB_KEY in .env.local
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Config ─────────────────────────────────────────────────────────────────

/** Minimum PeeringDB net_count for a new facility to be added to the dataset */
const NET_COUNT_THRESHOLD = 20;

/** Minimum name similarity score (0–1) to accept a match between an existing DC and a PeeringDB facility */
const MATCH_THRESHOLD = 0.3;

/** Only match these providerTypes to PeeringDB (cloud regions are not single PDB facilities) */
const MATCHABLE_TYPES = new Set(['colocation', 'tech-giant']);

// ─── .env.local parser ───────────────────────────────────────────────────────

function loadEnv() {
  try {
    const content = readFileSync(resolve(ROOT, '.env.local'), 'utf-8');
    const env = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
    return env;
  } catch {
    return {};
  }
}

// ─── PeeringDB fetcher ───────────────────────────────────────────────────────

async function fetchAllUsFacilities(apiKey) {
  const facilities = [];
  let skip = 0;
  const limit = 500;

  console.log('Fetching US facilities from PeeringDB...');

  while (true) {
    const url =
      `https://www.peeringdb.com/api/fac?country=US&status=ok&depth=0&limit=${limit}&skip=${skip}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`PeeringDB API error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const batch = json.data ?? [];
    facilities.push(...batch);
    process.stdout.write(`\r  ${facilities.length} facilities fetched...`);

    if (batch.length < limit) break;
    skip += limit;
  }

  console.log(`\nTotal US facilities fetched: ${facilities.length}\n`);
  return facilities;
}

// ─── Name utilities ───────────────────────────────────────────────────────────

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Jaccard word-set similarity + substring containment.
 * Returns 0–1 (1 = identical or one contains the other).
 */
function nameSimilarity(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);

  // Substring containment is a strong signal
  if (na.includes(nb) || nb.includes(na)) return 1.0;

  // Jaccard similarity on words longer than 2 chars
  const wordsA = new Set(na.split(/\s+/).filter((w) => w.length > 2));
  const wordsB = new Set(nb.split(/\s+/).filter((w) => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
}

/**
 * Strip legal suffixes from an org name.
 * "Equinix, Inc." → "Equinix"
 */
function normalizeOrgName(orgName) {
  return orgName
    .replace(/,?\s*(Inc\.?|LLC\.?|Ltd\.?|Corp\.?|Corporation|Limited|Co\.)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Matching ─────────────────────────────────────────────────────────────────

/**
 * Build a city-keyed lookup from PeeringDB facilities.
 * city (lowercase) → facility[]
 */
function buildCityLookup(facilities) {
  const lookup = {};
  for (const fac of facilities) {
    const city = (fac.city ?? '').toLowerCase();
    if (!lookup[city]) lookup[city] = [];
    lookup[city].push(fac);
  }
  return lookup;
}

/**
 * Find the best-matching PeeringDB facility for an existing DC.
 * Returns the facility or null if no match above threshold.
 */
function findBestMatch(dc, pdbByCity) {
  const dcCity = (dc.city ?? '').toLowerCase();
  const candidates = pdbByCity[dcCity] ?? [];
  if (candidates.length === 0) return null;

  const dcName = dc.displayName || dc.name || '';
  let best = null;
  let bestScore = MATCH_THRESHOLD - 0.001; // must exceed threshold

  for (const fac of candidates) {
    const score = nameSimilarity(dcName, fac.name);
    if (score > bestScore) {
      bestScore = score;
      best = fac;
    }
  }

  return best;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Load API key
  const env = loadEnv();
  const apiKey = env['PEERING_DB_KEY'];
  if (!apiKey) {
    console.error('Error: PEERING_DB_KEY not found in .env.local');
    process.exit(1);
  }

  // Load existing datacenters
  const dcPath = resolve(ROOT, 'lib/data/datacenters.json');
  const existingDcs = JSON.parse(readFileSync(dcPath, 'utf-8'));
  console.log(`Loaded ${existingDcs.length} existing datacenters\n`);

  // Fetch from PeeringDB
  const pdbFacilities = await fetchAllUsFacilities(apiKey);

  // Build city lookup
  const pdbByCity = buildCityLookup(pdbFacilities);

  // ── Step 1: Enrich existing DCs ──────────────────────────────────────────
  const matchedPdbIds = new Set();
  let enrichedCount = 0;
  const unmatchedNames = [];

  const enrichedDcs = existingDcs.map((dc) => {
    const providerType = dc.providerType ?? dc.metadata?.providerType;

    // Only attempt to match colocation and tech-giant facilities
    if (!MATCHABLE_TYPES.has(providerType)) return dc;

    const match = findBestMatch(dc, pdbByCity);
    if (!match) {
      unmatchedNames.push(dc.displayName || dc.name);
      return dc;
    }

    matchedPdbIds.add(match.id);
    enrichedCount++;

    return {
      ...dc,
      metadata: {
        ...(dc.metadata ?? {}),
        peeringDbId: match.id,
        netCount: match.net_count,
        ixCount: match.ix_count,
        carrierCount: match.carrier_count,
        // Only overwrite address fields if PeeringDB has them
        ...(match.address1 ? { address1: match.address1 } : {}),
        ...(match.address2 ? { address2: match.address2 } : {}),
        ...(match.zipcode ? { zipcode: match.zipcode } : {}),
        ...(match.clli ? { clli: match.clli } : {}),
      },
    };
  });

  // ── Step 2: Add new notable facilities ───────────────────────────────────
  const newDcs = [];

  for (const fac of pdbFacilities) {
    if (matchedPdbIds.has(fac.id)) continue;
    if ((fac.net_count ?? 0) < NET_COUNT_THRESHOLD) continue;
    if (!fac.latitude || !fac.longitude) continue;
    if (!fac.state) continue;

    const provider = normalizeOrgName(fac.org_name ?? 'Unknown');

    newDcs.push({
      id: `pdb-${fac.id}`,
      provider,
      providerType: 'colocation',
      name: fac.name,
      displayName: fac.name,
      city: fac.city ?? '',
      state: fac.state,
      country: 'US',
      lat: fac.latitude,
      lng: fac.longitude,
      verified: false,
      source: 'community',
      metadata: {
        ...(fac.website ? { url: fac.website } : {}),
        ...(fac.status_dashboard ? { statusDashboard: fac.status_dashboard } : {}),
        ...(fac.address1 ? { address1: fac.address1 } : {}),
        ...(fac.address2 ? { address2: fac.address2 } : {}),
        ...(fac.zipcode ? { zipcode: fac.zipcode } : {}),
        ...(fac.clli ? { clli: fac.clli } : {}),
        peeringDbId: fac.id,
        netCount: fac.net_count,
        ixCount: fac.ix_count,
        carrierCount: fac.carrier_count,
      },
    });
  }

  // ── Write output ──────────────────────────────────────────────────────────
  const finalDcs = [...enrichedDcs, ...newDcs];
  writeFileSync(dcPath, JSON.stringify(finalDcs, null, 2), 'utf-8');

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('─'.repeat(52));
  console.log('✅ Sync complete!\n');
  console.log(`PeeringDB US facilities fetched:   ${pdbFacilities.length}`);
  console.log(`Existing DCs enriched:             ${enrichedCount}`);
  console.log(`New DCs added (net_count ≥ ${NET_COUNT_THRESHOLD}):    ${newDcs.length}`);
  console.log(`Final datacenter count:            ${finalDcs.length}`);

  if (unmatchedNames.length > 0) {
    console.log(
      `\nColocation/tech-giant DCs with no PeeringDB match (${unmatchedNames.length}):`
    );
    unmatchedNames.forEach((n) => console.log(`  - ${n}`));
  }

  console.log('\nNext steps:');
  console.log('  npm run dev     → verify new data in the app');
  console.log('  npm run typecheck → confirm no TS errors');
}

main().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
