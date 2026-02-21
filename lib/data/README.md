# Datacenter Seed Dataset

**Created**: 2026-02-20  
**Total Locations**: 105 datacenters  
**Unique Providers**: 23  
**Geographic Coverage**: USA only  

---

## Dataset Overview

### By Provider Type
- **Hyperscale Cloud** (31): AWS, Azure, GCP, Oracle, IBM, Alibaba
- **Colocation** (24): Equinix, Digital Realty, CoreSite, CyrusOne, QTS, Switch, Flexential
- **Tech Giants** (21): Meta, Google, Apple, Microsoft
- **Regional Cloud** (21): DigitalOcean, Vultr, Linode, OVH, Hetzner
- **Edge/CDN** (8): Cloudflare

### Top Providers by Location Count
1. **Azure** - 9 locations
2. **GCP** - 8 locations
3. **Meta** - 8 locations
4. **Vultr** - 8 locations
5. **Equinix** - 7 locations
6. **AWS** - 6 locations (excluding GovCloud)
7. **Google** - 6 locations

### Geographic Distribution (Top 10 States)
1. **Virginia (VA)** - 16 locations (Ashburn datacenter corridor)
2. **California (CA)** - 15 locations (Silicon Valley, LA, SF)
3. **Texas (TX)** - 10 locations (Dallas, Fort Worth, San Antonio)
4. **Oregon (OR)** - 8 locations (Portland region)
5. **Illinois (IL)** - 7 locations (Chicago)
6. **Iowa (IA)** - 4 locations (Google, Meta, Azure)
7. **Washington (WA)** - 4 locations (Seattle region)
8. **Nevada (NV)** - 4 locations (Reno, Las Vegas - Switch)
9. **Arizona (AZ)** - 4 locations (Phoenix)
10. **Georgia (GA)** - 4 locations (Atlanta)

### Sustainability
- **Renewable Energy**: 49/105 locations (50.5%)
- **Average PUE**: 1.25 (varies by provider type)
- **Best PUE**: 1.06 (Meta Papillion)
- **LEED Certified**: 12 locations

---

## Data Structure

Each datacenter entry includes:

```json
{
  "id": "provider-location",
  "provider": "ProviderName",
  "providerType": "hyperscale-cloud|colocation|tech-giant|regional-cloud|edge-cdn",
  "name": "internal-name",
  "displayName": "Human Readable Name",
  "city": "City",
  "state": "ST",
  "country": "US",
  "lat": 00.0000,
  "lng": -00.0000,
  "region": "us-east|us-west|us-central|us-south",
  "availabilityZones": 3,
  "opened": 2020,
  "capacityMW": 100,
  "renewable": true,
  "pue": 1.2,
  "certifications": ["ISO 27001", "SOC 2"],
  "metadata": {
    "url": "https://...",
    "statusPage": "https://...",
    "notes": "..."
  },
  "verified": true,
  "source": "official"
}
```

---

## Data Sources

All locations verified from official provider sources:

### Hyperscale Cloud
- **AWS**: https://aws.amazon.com/about-aws/global-infrastructure/regions_az/
- **Azure**: https://azure.microsoft.com/en-us/explore/global-infrastructure/geographies/
- **GCP**: https://cloud.google.com/about/locations
- **Oracle Cloud**: https://www.oracle.com/cloud/data-regions/
- **IBM Cloud**: https://www.ibm.com/cloud/data-centers/
- **Alibaba Cloud**: https://www.alibabacloud.com/global-locations

### Tech Giants
- **Meta**: https://sustainability.fb.com/data-centers/
- **Google**: https://www.google.com/about/datacenters/locations/
- **Apple**: https://www.apple.com/environment/
- **Microsoft**: https://www.microsoft.com/en-us/datacenter

### Colocation Providers
- **Equinix**: https://www.equinix.com/data-centers/
- **Digital Realty**: https://www.digitalrealty.com/data-centers
- **CoreSite**: https://www.coresite.com/data-centers/locations
- **CyrusOne**: https://cyrusone.com/data-centers/
- **QTS**: https://www.qtsdatacenters.com/data-centers
- **Switch**: https://www.switch.com/
- **Flexential**: https://www.flexential.com/data-centers

### Regional Cloud/VPS
- **DigitalOcean**: https://www.digitalocean.com/products/droplets
- **Vultr**: https://www.vultr.com/features/datacenter-locations/
- **Linode**: https://www.linode.com/global-infrastructure/
- **OVH**: https://www.ovhcloud.com/en/about-us/global-infrastructure/
- **Hetzner**: https://www.hetzner.com/

### Edge/CDN
- **Cloudflare**: https://www.cloudflare.com/network/

---

## Coordinates Note

Coordinates are city-level approximations (not exact facility locations) based on:
- Provider-published region/city information
- Google Maps geocoding for city centers
- Public datacenter addresses where available

For security and privacy reasons, exact street addresses are not included.

---

## Future Expansion

This seed dataset will be expanded through:

1. **User Contributions** - Community-submitted datacenter locations (Clerk auth + Postgres)
2. **Provider Updates** - Quarterly scraping of provider region pages
3. **Industry Sources** - Data Center Knowledge, Uptime Institute, etc.

**Goal**: 500+ verified global datacenter locations

---

## Usage

### API Endpoint
```typescript
GET /api/datacenters
```

Returns:
```json
{
  "count": 105,
  "datacenters": [...],
  "source": "Comprehensive Seed Data",
  "providers": 23,
  "cached": true
}
```

### Direct Import
```typescript
import datacenters from '@/lib/data/datacenters.json';
```

---

## License

**Data**: Facts about datacenter locations (publicly available information)  
**Format**: MIT License (structure, organization, metadata)

Individual provider data remains property of respective companies.

---

**Last Updated**: 2026-02-20  
**Version**: 1.0.0  
**Maintainer**: Kael (OpenClaw)
