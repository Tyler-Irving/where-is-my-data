import { NextResponse } from 'next/server';
import { statSync } from 'fs';
import { join } from 'path';
import datacentersData from '@/lib/data/datacenters.json';

interface RawDatacenter {
  id: string;
  name?: string;
  displayName?: string;
  provider: string;
  providerType?: string;
  lat: number;
  lng: number;
  city?: string;
  state: string;
  country?: string;
  region?: string;
  availabilityZones?: number;
  opened?: number;
  capacityMW?: number;
  renewable?: boolean;
  pue?: number;
  certifications?: string[];
  verified: boolean;
  source: string;
  metadata?: Record<string, unknown>;
}

// Reflects the actual last-write time of datacenters.json (updated by sync-peeringdb.mjs)
const DATA_LAST_UPDATED = statSync(
  join(process.cwd(), 'lib/data/datacenters.json')
).mtime.toISOString();

export async function GET() {
  try {
    const datacenters = (datacentersData as RawDatacenter[]).map((dc) => ({
      id: dc.id,
      name: dc.name || dc.displayName,
      provider: dc.provider,
      lat: dc.lat,
      lng: dc.lng,
      city: dc.city,
      state: dc.state,
      country: dc.country ?? 'US',
      powerStatus: 'none' as const,
      waterStatus: 'none' as const,
      verified: dc.verified,
      source: dc.source,
      lastUpdated: DATA_LAST_UPDATED,
      metadata: {
        url: dc.metadata?.url,
        providerType: dc.providerType,
        region: dc.region,
        displayName: dc.displayName,
        opened: dc.opened,
        capacityMW: dc.capacityMW,
        renewable: dc.renewable,
        pue: dc.pue,
        certifications: dc.certifications,
        availabilityZones: dc.availabilityZones,
        ...dc.metadata
      }
    }));

    const response = NextResponse.json({
      count: datacenters.length,
      datacenters,
      source: 'Comprehensive Seed Data',
      providers: new Set(datacenters.map((dc) => dc.provider)).size,
      cached: true,
    });

    // Static data — cache aggressively at CDN/browser layer.
    // ETag is derived from the data file's last-modified time so it
    // automatically invalidates whenever sync-peeringdb.mjs rewrites
    // datacenters.json and a new deploy is triggered.
    response.headers.set(
      'Cache-Control',
      'public, max-age=3600, stale-while-revalidate=86400'
    );
    response.headers.set('ETag', `"${DATA_LAST_UPDATED}"`);

    return response;

  } catch (error) {
    console.error('Error loading datacenter data:', error);
    return NextResponse.json(
      { error: 'Failed to load datacenter data' },
      { status: 500 }
    );
  }
}
