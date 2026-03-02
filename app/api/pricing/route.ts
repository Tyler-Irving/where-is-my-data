import { NextResponse } from 'next/server';
import { statSync } from 'fs';
import { join } from 'path';
import pricingData from '@/lib/data/pricing.json';

// Reflects the actual last-write time of pricing.json
const DATA_LAST_UPDATED = statSync(
  join(process.cwd(), 'lib/data/pricing.json')
).mtime.toISOString();

export async function GET() {
  try {
    const response = NextResponse.json({
      lastUpdated: pricingData.lastUpdated,
      currency: pricingData.currency,
      datacenters: pricingData.datacenters,
      summary: pricingData.summary,
      cached: true,
    });

    // Static data — cache aggressively at CDN/browser layer.
    // ETag is derived from the data file's last-modified time so it
    // automatically invalidates whenever pricing.json is updated and
    // a new deploy is triggered.
    response.headers.set(
      'Cache-Control',
      'public, max-age=3600, stale-while-revalidate=86400'
    );
    response.headers.set('ETag', `"${DATA_LAST_UPDATED}"`);

    return response;
  } catch (error) {
    console.error('Error loading pricing data:', error);
    return NextResponse.json(
      { error: 'Failed to load pricing data' },
      { status: 500 }
    );
  }
}
