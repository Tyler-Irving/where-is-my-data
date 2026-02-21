import { NextResponse } from 'next/server';
import datacentersData from '@/lib/data/datacenters.json';

export async function GET() {
  try {
    // Transform JSON data to match frontend expectations
    const datacenters = datacentersData.map((dc: any) => ({
      id: dc.id,
      name: dc.name || dc.displayName,
      provider: dc.provider,
      lat: dc.lat,
      lng: dc.lng,
      city: dc.city,
      state: dc.state,
      powerStatus: 'none', // Static data has no real-time status
      waterStatus: 'none',
      verified: dc.verified,
      source: dc.source,
      lastUpdated: new Date().toISOString(),
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

    return NextResponse.json({
      count: datacenters.length,
      datacenters,
      source: 'Comprehensive Seed Data',
      providers: Array.from(new Set(datacenters.map((dc: any) => dc.provider))).length,
      cached: true,
    });

  } catch (error) {
    console.error('Error loading datacenter data:', error);
    return NextResponse.json(
      { error: 'Failed to load datacenter data' },
      { status: 500 }
    );
  }
}
