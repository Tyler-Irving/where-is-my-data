#!/usr/bin/env node
/**
 * scripts/sync-providers.mjs
 *
 * Syncs cloud provider region data into lib/data/datacenters.json.
 *
 * What it does:
 *   1. For each provider (AWS, GCP, Azure), loads region data
 *      - AWS/Azure: hardcoded coordinate maps
 *      - GCP: fetched from https://www.gstatic.com/cloud-site-ux/locations.json
 *   2. For each region:
 *      - If an entry with a matching `id` exists: UPDATE lat, lng, lastUpdated
 *      - If no entry exists: ADD a new entry with safe defaults
 *   3. Writes updated lib/data/datacenters.json
 *   4. Prints a per-provider summary (updated / added counts)
 *
 * Usage:
 *   node scripts/sync-providers.mjs                        # all three providers
 *   node scripts/sync-providers.mjs --providers aws        # AWS only
 *   node scripts/sync-providers.mjs --providers gcp,azure  # GCP + Azure
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const providersArgIdx = args.indexOf('--providers');
const PROVIDERS_ARG = providersArgIdx >= 0 ? (args[providersArgIdx + 1] ?? '') : '';

/** Set of provider keys to run. Defaults to all three. */
const ACTIVE_PROVIDERS = PROVIDERS_ARG
  ? new Set(PROVIDERS_ARG.toLowerCase().split(',').map((p) => p.trim()).filter(Boolean))
  : new Set(['aws', 'gcp', 'azure']);

const VALID_PROVIDERS = new Set(['aws', 'gcp', 'azure']);
for (const p of ACTIVE_PROVIDERS) {
  if (!VALID_PROVIDERS.has(p)) {
    console.error(`Unknown provider: "${p}". Valid options: aws, gcp, azure`);
    process.exit(1);
  }
}

// ─── AWS region map ───────────────────────────────────────────────────────────

/** @type {Array<{id: string, region: string, name: string, lat: number, lng: number, city: string, state: string, country: string, azs: number}>} */
const AWS_REGIONS = [
  { id: 'aws-us-east-1',      region: 'us-east-1',      name: 'US East (N. Virginia)',        lat: 38.9519,  lng: -77.4480,  city: 'Ashburn',      state: 'VA', country: 'US', azs: 6 },
  { id: 'aws-us-east-2',      region: 'us-east-2',      name: 'US East (Ohio)',                lat: 39.9612,  lng: -82.9988,  city: 'Columbus',     state: 'OH', country: 'US', azs: 3 },
  { id: 'aws-us-west-1',      region: 'us-west-1',      name: 'US West (N. California)',       lat: 37.3382,  lng: -121.8863, city: 'San Jose',     state: 'CA', country: 'US', azs: 2 },
  { id: 'aws-us-west-2',      region: 'us-west-2',      name: 'US West (Oregon)',              lat: 45.5051,  lng: -122.6750, city: 'Portland',     state: 'OR', country: 'US', azs: 4 },
  { id: 'aws-eu-west-1',      region: 'eu-west-1',      name: 'EU (Ireland)',                  lat: 53.3498,  lng: -6.2603,   city: 'Dublin',       state: 'IE', country: 'IE', azs: 3 },
  { id: 'aws-eu-west-2',      region: 'eu-west-2',      name: 'EU (London)',                   lat: 51.5074,  lng: -0.1278,   city: 'London',       state: 'GB', country: 'GB', azs: 3 },
  { id: 'aws-eu-west-3',      region: 'eu-west-3',      name: 'EU (Paris)',                    lat: 48.8566,  lng: 2.3522,    city: 'Paris',        state: 'FR', country: 'FR', azs: 3 },
  { id: 'aws-eu-central-1',   region: 'eu-central-1',   name: 'EU (Frankfurt)',                lat: 50.1109,  lng: 8.6821,    city: 'Frankfurt',    state: 'DE', country: 'DE', azs: 3 },
  { id: 'aws-eu-central-2',   region: 'eu-central-2',   name: 'EU (Zurich)',                   lat: 47.3769,  lng: 8.5417,    city: 'Zurich',       state: 'CH', country: 'CH', azs: 3 },
  { id: 'aws-eu-north-1',     region: 'eu-north-1',     name: 'EU (Stockholm)',                lat: 59.3293,  lng: 18.0686,   city: 'Stockholm',    state: 'SE', country: 'SE', azs: 3 },
  { id: 'aws-eu-south-1',     region: 'eu-south-1',     name: 'EU (Milan)',                    lat: 45.4642,  lng: 9.1900,    city: 'Milan',        state: 'IT', country: 'IT', azs: 3 },
  { id: 'aws-eu-south-2',     region: 'eu-south-2',     name: 'EU (Spain)',                    lat: 40.4168,  lng: -3.7038,   city: 'Madrid',       state: 'ES', country: 'ES', azs: 3 },
  { id: 'aws-ap-east-1',      region: 'ap-east-1',      name: 'Asia Pacific (Hong Kong)',      lat: 22.3193,  lng: 114.1694,  city: 'Hong Kong',    state: 'HK', country: 'HK', azs: 3 },
  { id: 'aws-ap-south-1',     region: 'ap-south-1',     name: 'Asia Pacific (Mumbai)',         lat: 19.0760,  lng: 72.8777,   city: 'Mumbai',       state: 'IN', country: 'IN', azs: 3 },
  { id: 'aws-ap-south-2',     region: 'ap-south-2',     name: 'Asia Pacific (Hyderabad)',      lat: 17.3850,  lng: 78.4867,   city: 'Hyderabad',    state: 'IN', country: 'IN', azs: 3 },
  { id: 'aws-ap-northeast-1', region: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)',          lat: 35.6762,  lng: 139.6503,  city: 'Tokyo',        state: 'JP', country: 'JP', azs: 4 },
  { id: 'aws-ap-northeast-2', region: 'ap-northeast-2', name: 'Asia Pacific (Seoul)',          lat: 37.5665,  lng: 126.9780,  city: 'Seoul',        state: 'KR', country: 'KR', azs: 4 },
  { id: 'aws-ap-northeast-3', region: 'ap-northeast-3', name: 'Asia Pacific (Osaka)',          lat: 34.6937,  lng: 135.5023,  city: 'Osaka',        state: 'JP', country: 'JP', azs: 3 },
  { id: 'aws-ap-southeast-1', region: 'ap-southeast-1', name: 'Asia Pacific (Singapore)',      lat: 1.3521,   lng: 103.8198,  city: 'Singapore',    state: 'SG', country: 'SG', azs: 3 },
  { id: 'aws-ap-southeast-2', region: 'ap-southeast-2', name: 'Asia Pacific (Sydney)',         lat: -33.8688, lng: 151.2093,  city: 'Sydney',       state: 'AU', country: 'AU', azs: 3 },
  { id: 'aws-ap-southeast-3', region: 'ap-southeast-3', name: 'Asia Pacific (Jakarta)',        lat: -6.2088,  lng: 106.8456,  city: 'Jakarta',      state: 'ID', country: 'ID', azs: 3 },
  { id: 'aws-ap-southeast-4', region: 'ap-southeast-4', name: 'Asia Pacific (Melbourne)',      lat: -37.8136, lng: 144.9631,  city: 'Melbourne',    state: 'AU', country: 'AU', azs: 3 },
  { id: 'aws-ap-southeast-5', region: 'ap-southeast-5', name: 'Asia Pacific (Malaysia)',       lat: 3.1390,   lng: 101.6869,  city: 'Kuala Lumpur', state: 'MY', country: 'MY', azs: 3 },
  { id: 'aws-ca-central-1',   region: 'ca-central-1',   name: 'Canada (Central)',              lat: 45.5017,  lng: -73.5673,  city: 'Montreal',     state: 'QC', country: 'CA', azs: 3 },
  { id: 'aws-ca-west-1',      region: 'ca-west-1',      name: 'Canada (Calgary)',              lat: 51.0447,  lng: -114.0719, city: 'Calgary',      state: 'AB', country: 'CA', azs: 3 },
  { id: 'aws-sa-east-1',      region: 'sa-east-1',      name: 'South America (São Paulo)',     lat: -23.5505, lng: -46.6333,  city: 'São Paulo',    state: 'BR', country: 'BR', azs: 3 },
  { id: 'aws-me-south-1',     region: 'me-south-1',     name: 'Middle East (Bahrain)',         lat: 26.0667,  lng: 50.5577,   city: 'Manama',       state: 'BH', country: 'BH', azs: 3 },
  { id: 'aws-me-central-1',   region: 'me-central-1',   name: 'Middle East (UAE)',             lat: 25.2048,  lng: 55.2708,   city: 'Dubai',        state: 'AE', country: 'AE', azs: 3 },
  { id: 'aws-af-south-1',     region: 'af-south-1',     name: 'Africa (Cape Town)',            lat: -33.9249, lng: 18.4241,   city: 'Cape Town',    state: 'ZA', country: 'ZA', azs: 3 },
  { id: 'aws-il-central-1',   region: 'il-central-1',   name: 'Israel (Tel Aviv)',             lat: 32.0853,  lng: 34.7818,   city: 'Tel Aviv',     state: 'IL', country: 'IL', azs: 3 },
  { id: 'aws-mx-central-1',   region: 'mx-central-1',   name: 'Mexico (Central)',              lat: 20.6597,  lng: -103.3496, city: 'Guadalajara',  state: 'MX', country: 'MX', azs: 3 },
];

// ─── Azure region map ─────────────────────────────────────────────────────────

/** @type {Array<{id: string, region: string, name: string, lat: number, lng: number, city: string, state: string, country: string, azs: number}>} */
const AZURE_REGIONS = [
  { id: 'azure-eastus',             region: 'eastus',             name: 'East US',                   lat: 37.3719,  lng: -79.8164,  city: 'Boydton',       state: 'VA', country: 'US', azs: 3 },
  { id: 'azure-eastus2',            region: 'eastus2',            name: 'East US 2',                 lat: 36.6681,  lng: -78.3889,  city: 'Boydton',       state: 'VA', country: 'US', azs: 3 },
  { id: 'azure-westus',             region: 'westus',             name: 'West US',                   lat: 37.7833,  lng: -122.4167, city: 'San Francisco', state: 'CA', country: 'US', azs: 3 },
  { id: 'azure-westus2',            region: 'westus2',            name: 'West US 2',                 lat: 47.2331,  lng: -119.8529, city: 'Quincy',        state: 'WA', country: 'US', azs: 3 },
  { id: 'azure-westus3',            region: 'westus3',            name: 'West US 3',                 lat: 33.4484,  lng: -112.0740, city: 'Phoenix',       state: 'AZ', country: 'US', azs: 3 },
  { id: 'azure-centralus',          region: 'centralus',          name: 'Central US',                lat: 41.5908,  lng: -93.6208,  city: 'Des Moines',    state: 'IA', country: 'US', azs: 3 },
  { id: 'azure-northcentralus',     region: 'northcentralus',     name: 'North Central US',          lat: 41.8819,  lng: -87.6278,  city: 'Chicago',       state: 'IL', country: 'US', azs: 0 },
  { id: 'azure-southcentralus',     region: 'southcentralus',     name: 'South Central US',          lat: 29.4167,  lng: -98.5000,  city: 'San Antonio',   state: 'TX', country: 'US', azs: 3 },
  { id: 'azure-westcentralus',      region: 'westcentralus',      name: 'West Central US',           lat: 40.8900,  lng: -110.3400, city: 'Cheyenne',      state: 'WY', country: 'US', azs: 0 },
  { id: 'azure-northeurope',        region: 'northeurope',        name: 'North Europe',              lat: 53.3478,  lng: -6.2597,   city: 'Dublin',        state: 'IE', country: 'IE', azs: 3 },
  { id: 'azure-westeurope',         region: 'westeurope',         name: 'West Europe',               lat: 52.3667,  lng: 4.9000,    city: 'Amsterdam',     state: 'NL', country: 'NL', azs: 3 },
  { id: 'azure-eastasia',           region: 'eastasia',           name: 'East Asia',                 lat: 22.2670,  lng: 114.1880,  city: 'Hong Kong',     state: 'HK', country: 'HK', azs: 3 },
  { id: 'azure-southeastasia',      region: 'southeastasia',      name: 'Southeast Asia',            lat: 1.2930,   lng: 103.8558,  city: 'Singapore',     state: 'SG', country: 'SG', azs: 3 },
  { id: 'azure-japaneast',          region: 'japaneast',          name: 'Japan East',                lat: 35.6762,  lng: 139.6503,  city: 'Tokyo',         state: 'JP', country: 'JP', azs: 3 },
  { id: 'azure-japanwest',          region: 'japanwest',          name: 'Japan West',                lat: 34.6939,  lng: 135.5022,  city: 'Osaka',         state: 'JP', country: 'JP', azs: 0 },
  { id: 'azure-brazilsouth',        region: 'brazilsouth',        name: 'Brazil South',              lat: -23.5505, lng: -46.6333,  city: 'São Paulo',     state: 'BR', country: 'BR', azs: 3 },
  { id: 'azure-australiaeast',      region: 'australiaeast',      name: 'Australia East',            lat: -33.8688, lng: 151.2093,  city: 'Sydney',        state: 'AU', country: 'AU', azs: 3 },
  { id: 'azure-australiasoutheast', region: 'australiasoutheast', name: 'Australia Southeast',       lat: -37.8136, lng: 144.9631,  city: 'Melbourne',     state: 'AU', country: 'AU', azs: 0 },
  { id: 'azure-southindia',         region: 'southindia',         name: 'South India',               lat: 12.9822,  lng: 80.1636,   city: 'Chennai',       state: 'IN', country: 'IN', azs: 0 },
  { id: 'azure-centralindia',       region: 'centralindia',       name: 'Central India',             lat: 18.5822,  lng: 73.9197,   city: 'Pune',          state: 'IN', country: 'IN', azs: 0 },
  { id: 'azure-westindia',          region: 'westindia',          name: 'West India',                lat: 19.0760,  lng: 72.8777,   city: 'Mumbai',        state: 'IN', country: 'IN', azs: 0 },
  { id: 'azure-canadacentral',      region: 'canadacentral',      name: 'Canada Central',            lat: 43.6532,  lng: -79.3832,  city: 'Toronto',       state: 'ON', country: 'CA', azs: 3 },
  { id: 'azure-canadaeast',         region: 'canadaeast',         name: 'Canada East',               lat: 46.8139,  lng: -71.2080,  city: 'Quebec City',   state: 'QC', country: 'CA', azs: 0 },
  { id: 'azure-uksouth',            region: 'uksouth',            name: 'UK South',                  lat: 51.5074,  lng: -0.1278,   city: 'London',        state: 'GB', country: 'GB', azs: 3 },
  { id: 'azure-ukwest',             region: 'ukwest',             name: 'UK West',                   lat: 51.4816,  lng: -3.1791,   city: 'Cardiff',       state: 'GB', country: 'GB', azs: 0 },
  { id: 'azure-koreacentral',       region: 'koreacentral',       name: 'Korea Central',             lat: 37.5665,  lng: 126.9780,  city: 'Seoul',         state: 'KR', country: 'KR', azs: 3 },
  { id: 'azure-koreasouth',         region: 'koreasouth',         name: 'Korea South',               lat: 35.1796,  lng: 129.0756,  city: 'Busan',         state: 'KR', country: 'KR', azs: 0 },
  { id: 'azure-francecentral',      region: 'francecentral',      name: 'France Central',            lat: 46.3772,  lng: 2.3730,    city: 'Paris',         state: 'FR', country: 'FR', azs: 3 },
  { id: 'azure-francesouth',        region: 'francesouth',        name: 'France South',              lat: 43.8345,  lng: 2.1972,    city: 'Marseille',     state: 'FR', country: 'FR', azs: 0 },
  { id: 'azure-australiacentral',   region: 'australiacentral',   name: 'Australia Central',         lat: -35.3075, lng: 149.1244,  city: 'Canberra',      state: 'AU', country: 'AU', azs: 0 },
  { id: 'azure-australiacentral2',  region: 'australiacentral2',  name: 'Australia Central 2',       lat: -35.3075, lng: 149.1244,  city: 'Canberra',      state: 'AU', country: 'AU', azs: 0 },
  { id: 'azure-southafricanorth',   region: 'southafricanorth',   name: 'South Africa North',        lat: -25.7461, lng: 28.1881,   city: 'Johannesburg',  state: 'ZA', country: 'ZA', azs: 3 },
  { id: 'azure-southafricawest',    region: 'southafricawest',    name: 'South Africa West',         lat: -34.0754, lng: 18.8647,   city: 'Cape Town',     state: 'ZA', country: 'ZA', azs: 0 },
  { id: 'azure-uaenorth',           region: 'uaenorth',           name: 'UAE North',                 lat: 25.2048,  lng: 55.2708,   city: 'Dubai',         state: 'AE', country: 'AE', azs: 3 },
  { id: 'azure-uaecentral',         region: 'uaecentral',         name: 'UAE Central',               lat: 24.4667,  lng: 54.3667,   city: 'Abu Dhabi',     state: 'AE', country: 'AE', azs: 0 },
  { id: 'azure-switzerlandnorth',   region: 'switzerlandnorth',   name: 'Switzerland North',         lat: 47.4510,  lng: 8.5641,    city: 'Zurich',        state: 'CH', country: 'CH', azs: 3 },
  { id: 'azure-switzerlandwest',    region: 'switzerlandwest',    name: 'Switzerland West',          lat: 46.2044,  lng: 6.1432,    city: 'Geneva',        state: 'CH', country: 'CH', azs: 0 },
  { id: 'azure-germanywestcentral', region: 'germanywestcentral', name: 'Germany West Central',      lat: 50.1109,  lng: 8.6821,    city: 'Frankfurt',     state: 'DE', country: 'DE', azs: 3 },
  { id: 'azure-germanynorth',       region: 'germanynorth',       name: 'Germany North',             lat: 53.0731,  lng: 8.8078,    city: 'Berlin',        state: 'DE', country: 'DE', azs: 0 },
  { id: 'azure-norwayeast',         region: 'norwayeast',         name: 'Norway East',               lat: 59.9139,  lng: 10.7522,   city: 'Oslo',          state: 'NO', country: 'NO', azs: 3 },
  { id: 'azure-norwaywest',         region: 'norwaywest',         name: 'Norway West',               lat: 58.9690,  lng: 5.7330,    city: 'Stavanger',     state: 'NO', country: 'NO', azs: 0 },
  { id: 'azure-swedencentral',      region: 'swedencentral',      name: 'Sweden Central',            lat: 60.6749,  lng: 17.1413,   city: 'Gävle',         state: 'SE', country: 'SE', azs: 3 },
  { id: 'azure-polandcentral',      region: 'polandcentral',      name: 'Poland Central',            lat: 52.2297,  lng: 21.0122,   city: 'Warsaw',        state: 'PL', country: 'PL', azs: 3 },
  { id: 'azure-italynorth',         region: 'italynorth',         name: 'Italy North',               lat: 45.4642,  lng: 9.1900,    city: 'Milan',         state: 'IT', country: 'IT', azs: 3 },
  { id: 'azure-spaincentral',       region: 'spaincentral',       name: 'Spain Central',             lat: 40.4168,  lng: -3.7038,   city: 'Madrid',        state: 'ES', country: 'ES', azs: 3 },
  { id: 'azure-israelcentral',      region: 'israelcentral',      name: 'Israel Central',            lat: 31.7683,  lng: 35.2137,   city: 'Jerusalem',     state: 'IL', country: 'IL', azs: 3 },
  { id: 'azure-mexicocentral',      region: 'mexicocentral',      name: 'Mexico Central',            lat: 20.1106,  lng: -101.1854, city: 'Querétaro',     state: 'MX', country: 'MX', azs: 3 },
  { id: 'azure-brazilsoutheast',    region: 'brazilsoutheast',    name: 'Brazil Southeast',          lat: -22.9068, lng: -43.1729,  city: 'Rio de Janeiro',state: 'BR', country: 'BR', azs: 0 },
  { id: 'azure-newzealandnorth',    region: 'newzealandnorth',    name: 'New Zealand North',         lat: -36.8485, lng: 174.7633,  city: 'Auckland',      state: 'NZ', country: 'NZ', azs: 3 },
];

// ─── GCP fetcher ──────────────────────────────────────────────────────────────

const GCP_LOCATIONS_URL = 'https://www.gstatic.com/cloud-site-ux/locations.json';

/**
 * Fetches GCP region data. Returns an array of normalized region entries,
 * or an empty array on any error (with a warning printed).
 *
 * @returns {Promise<Array<{id: string, region: string, name: string, lat: number, lng: number, country: string}>>}
 */
async function fetchGcpRegions() {
  console.log(`Fetching GCP locations from ${GCP_LOCATIONS_URL} ...`);
  try {
    const res = await fetch(GCP_LOCATIONS_URL);
    if (!res.ok) {
      console.warn(`  Warning: GCP fetch returned HTTP ${res.status} ${res.statusText}. Skipping GCP.`);
      return [];
    }

    const raw = await res.json();

    // The response may be an array or an object with a data/locations key.
    // Normalise to a flat array defensively.
    let items;
    if (Array.isArray(raw)) {
      items = raw;
    } else if (raw && Array.isArray(raw.locations)) {
      items = raw.locations;
    } else if (raw && Array.isArray(raw.data)) {
      items = raw.data;
    } else {
      console.warn('  Warning: GCP response has unexpected shape (not array or {locations/data:[]}). Skipping GCP.');
      return [];
    }

    const regions = [];
    let skipped = 0;

    for (const item of items) {
      // Filter to REGION type only (skip ZONE, MULTI_REGION, etc.)
      if (typeof item.type === 'string' && item.type !== 'REGION') {
        continue;
      }

      // Validate required fields
      const regionId = item.id ?? item.region ?? item.regionId;
      const lat = typeof item.lat === 'number' ? item.lat
                : typeof item.latitude === 'number' ? item.latitude
                : null;
      const lng = typeof item.lng === 'number' ? item.lng
                : typeof item.lon === 'number' ? item.lon
                : typeof item.longitude === 'number' ? item.longitude
                : null;

      if (!regionId || lat === null || lng === null) {
        skipped++;
        continue;
      }

      const name = item.name ?? item.displayName ?? regionId;
      const country = item.countryCode ?? item.country ?? deriveCountryFromGcpRegion(regionId);

      regions.push({
        id: `gcp-${regionId}`,
        region: regionId,
        name,
        lat,
        lng,
        country,
      });
    }

    if (skipped > 0) {
      console.warn(`  Warning: skipped ${skipped} GCP entries missing id/lat/lng.`);
    }

    console.log(`  Found ${regions.length} GCP REGION entries.\n`);
    return regions;
  } catch (err) {
    console.warn(`  Warning: Failed to fetch/parse GCP locations: ${err.message}. Skipping GCP.`);
    return [];
  }
}

/**
 * Best-effort country code derivation from a GCP region string.
 * e.g. "us-central1" -> "US", "europe-west3" -> "DE" (Frankfurt, best guess)
 *
 * @param {string} regionId
 * @returns {string}
 */
function deriveCountryFromGcpRegion(regionId) {
  if (regionId.startsWith('us-'))           return 'US';
  if (regionId.startsWith('northamerica-')) return 'CA';
  if (regionId.startsWith('southamerica-')) return 'BR';
  if (regionId.startsWith('europe-'))       return 'EU';
  if (regionId.startsWith('asia-'))         return 'AS';
  if (regionId.startsWith('australia-'))    return 'AU';
  if (regionId.startsWith('me-'))           return 'AE';
  if (regionId.startsWith('africa-'))       return 'ZA';
  return 'US';
}

// ─── Sync logic ───────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0];

/**
 * Apply a list of provider regions to the existing datacenter array.
 * Returns { updated, added } counts and the mutated (or extended) array.
 *
 * @param {any[]} datacenters - current flat array from datacenters.json
 * @param {Array<{id: string, region: string, name: string, lat: number, lng: number, city?: string, state?: string, country: string, azs?: number}>} regions
 * @param {string} providerLabel - human-readable label for logging
 * @returns {{ datacenters: any[], updated: number, added: number }}
 */
function applyRegions(datacenters, regions, providerLabel) {
  // Build an id -> index map for O(1) lookup
  const idToIndex = new Map();
  for (let i = 0; i < datacenters.length; i++) {
    idToIndex.set(datacenters[i].id, i);
  }

  let updated = 0;
  let added = 0;

  for (const region of regions) {
    const existingIdx = idToIndex.get(region.id);

    if (existingIdx !== undefined) {
      // UPDATE: only touch lat, lng, lastUpdated
      const existing = datacenters[existingIdx];
      datacenters[existingIdx] = {
        ...existing,
        lat: region.lat,
        lng: region.lng,
        lastUpdated: TODAY,
      };
      updated++;
    } else {
      // ADD: new entry with safe defaults
      const newEntry = {
        id: region.id,
        provider: providerLabel,
        providerType: 'hyperscale-cloud',
        name: region.region,
        displayName: region.name,
        city: region.city ?? '',
        state: region.state ?? '',
        country: region.country,
        lat: region.lat,
        lng: region.lng,
        powerStatus: 'none',
        waterStatus: 'none',
        verified: false,
        source: 'official',
        lastUpdated: TODAY,
        metadata: {
          providerType: 'hyperscale-cloud',
          displayName: region.name,
          region: region.region,
          ...(region.azs ? { availabilityZones: region.azs } : {}),
        },
      };
      datacenters.push(newEntry);
      // Keep index map current in case of duplicate ids in source data (shouldn't happen)
      idToIndex.set(region.id, datacenters.length - 1);
      added++;
    }
  }

  return { updated, added };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('sync-providers.mjs');
  console.log('==================');
  console.log(`Providers: ${[...ACTIVE_PROVIDERS].join(', ')}`);
  console.log(`Date stamp: ${TODAY}\n`);

  // Load existing data
  const dcPath = resolve(ROOT, 'lib/data/datacenters.json');
  const datacenters = JSON.parse(readFileSync(dcPath, 'utf-8'));
  const initialCount = datacenters.length;
  console.log(`Loaded ${initialCount} existing datacenters.\n`);

  /** @type {Array<{provider: string, updated: number, added: number}>} */
  const summary = [];

  // ── AWS ──────────────────────────────────────────────────────────────────
  if (ACTIVE_PROVIDERS.has('aws')) {
    console.log('Processing AWS...');
    const { updated, added } = applyRegions(datacenters, AWS_REGIONS, 'AWS');
    summary.push({ provider: 'AWS', updated, added });
    console.log(`  Updated: ${updated}  |  Added: ${added}\n`);
  }

  // ── Azure ─────────────────────────────────────────────────────────────────
  if (ACTIVE_PROVIDERS.has('azure')) {
    console.log('Processing Azure...');
    const { updated, added } = applyRegions(datacenters, AZURE_REGIONS, 'Azure');
    summary.push({ provider: 'Azure', updated, added });
    console.log(`  Updated: ${updated}  |  Added: ${added}\n`);
  }

  // ── GCP ───────────────────────────────────────────────────────────────────
  if (ACTIVE_PROVIDERS.has('gcp')) {
    console.log('Processing GCP...');
    const gcpRegions = await fetchGcpRegions();
    if (gcpRegions.length > 0) {
      const { updated, added } = applyRegions(datacenters, gcpRegions, 'Google Cloud');
      summary.push({ provider: 'GCP', updated, added });
      console.log(`  Updated: ${updated}  |  Added: ${added}\n`);
    } else {
      summary.push({ provider: 'GCP', updated: 0, added: 0 });
      console.log('  GCP skipped (no data retrieved).\n');
    }
  }

  // ── Write ─────────────────────────────────────────────────────────────────
  writeFileSync(dcPath, JSON.stringify(datacenters, null, 2) + '\n', 'utf-8');

  // ── Summary ───────────────────────────────────────────────────────────────
  const totalUpdated = summary.reduce((s, r) => s + r.updated, 0);
  const totalAdded   = summary.reduce((s, r) => s + r.added, 0);

  console.log('─'.repeat(52));
  console.log('Sync complete!\n');
  console.log('Provider breakdown:');
  for (const row of summary) {
    console.log(`  ${row.provider.padEnd(12)} updated: ${String(row.updated).padStart(3)}  added: ${String(row.added).padStart(3)}`);
  }
  console.log('');
  console.log(`Total updated:         ${totalUpdated}`);
  console.log(`Total added:           ${totalAdded}`);
  console.log(`Final datacenter count: ${datacenters.length}  (was ${initialCount})`);
  console.log('\nNext steps:');
  console.log('  npm run dev       -> verify new data in the app');
  console.log('  npm run typecheck -> confirm no TS errors');
}

main().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
