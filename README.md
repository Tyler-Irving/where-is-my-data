# Where Is My Data?

Interactive map of cloud and colocation datacenters. Browse 234+ facilities across AWS, Google Cloud, Azure, Equinix, Meta, Apple, Cloudflare, and 20+ other providers — with latency estimation and cost comparison built in.

**Live:** [datacenter-globe.vercel.app](https://datacenter-globe.vercel.app)

---

## What it does

**Map & Search**
- 234 datacenters across 27+ cloud, colocation, and edge providers
- Real-time search by name, provider, city, or state
- Filter by provider type, capacity (MW), PUE, and renewable energy status
- Shareable URLs — any filtered view is bookmarkable and linkable

**Compare & Analyze**
- Side-by-side comparison of up to 3 datacenters
- Latency calculator between any two selected facilities (Haversine + routing overhead model)
- Cost estimator for 11 AWS, GCP, and Azure regions (compute, storage, transfer, database)
- Export filtered results as CSV or JSON

---

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Mapbox GL JS 3** + **react-map-gl 8** for map rendering
- **Zustand 5** for state management (7 stores)
- **Tailwind CSS 4**
- **Vitest 3** for unit tests
- Deployed on **Vercel** (auto-deploy from `master`)

---

## Setup

**Requirements:** Node.js 18+, a [Mapbox token](https://account.mapbox.com/access-tokens/) (free tier), and optionally a [PeeringDB API key](https://www.peeringdb.com/apidocs/) for data sync.

```bash
git clone https://github.com/Tyler-Irving/where-is-my-data.git
cd where-is-my-data
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
PEERING_DB_KEY=your_peeringdb_key   # optional, for data sync only
```

```bash
npm run dev     # http://localhost:3000
```

---

## Development commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run Vitest tests
npm run test:watch   # Watch mode
npm run lint         # ESLint
npm run typecheck    # TypeScript check
```

---

## Syncing PeeringDB data

The `scripts/sync-peeringdb.mjs` script enriches colocation and tech-giant facilities with PeeringDB metadata (network count, IX count, carrier count, address). It can also discover new notable facilities not already in the dataset.

```bash
node scripts/sync-peeringdb.mjs              # Sync US facilities (default)
node scripts/sync-peeringdb.mjs --country DE # Sync a specific country
```

Requires `PEERING_DB_KEY` in `.env.local`.

---

## Project structure

```
app/
  page.tsx                    # Root page
  api/datacenters/route.ts    # GET /api/datacenters
components/
  map/        MapContainer, DatacenterMarkers, FilterBar, SearchBar, MapControls, MapLegend
  latency/    LatencyCalculator, LatencyBadge, LatencyLines
  pricing/    CostCalculator, PricingBadge
  comparison/ ComparisonFooter, DatacenterThumbnail
  modals/     ComparisonModal, AboutModal, KeyboardShortcutsModal
lib/
  data/       datacenters.json, providers.json, pricing.json
  utils/      latency.ts, pricing.ts, filterDatacenters.ts, providerColors.ts
store/        datacenterStore, filterStore, mapStore, comparisonStore,
              latencyStore, pricingStore
hooks/        useUrlSync.ts
types/        datacenter.ts, latency.ts, pricing.ts
scripts/      sync-peeringdb.mjs
```

---

## Data sources

- **AWS, GCP, Azure**: Official region and availability zone documentation
- **Meta, Apple, xAI, Cloudflare**: Public announcements and infrastructure pages
- **Equinix, Digital Realty, CyrusOne, and other colos**: Facility directories
- **PeeringDB**: Colocation facility data

Data is a mix of `source: official`, `community`, and `estimated` — each datacenter entry is tagged accordingly.

---

## Roadmap

**In progress**
- International expansion — Germany (Frankfurt, Berlin, Munich) as first non-US region
- 3D globe view to support multi-country navigation

**Planned**
- Live pricing API (replace static estimates)
- Historical timeline — datacenter growth by year
- Compliance indicators — GDPR, HIPAA, SOC 2, ISO 27001 per region
- Public REST API for the datacenter dataset
- Live status / outage feed integration

---

## Contributing

Pull requests are welcome. For data corrections, open an issue with the datacenter name, what's wrong, and a source link (official documentation preferred).

---

## License

MIT — see [LICENSE](LICENSE).

Built by [Tyler Irving](https://tyler-irving.github.io) · Map tiles by [Mapbox](https://www.mapbox.com/)

<!-- Topics: datacenter map, cloud infrastructure, aws regions, gcp regions, azure regions, equinix, network peering, peeringdb, mapbox, nextjs, colocation, latency calculator, datacenter comparison -->
