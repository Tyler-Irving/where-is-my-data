# Where is my data?

Interactive map visualization of USA datacenters. Explore 131 datacenters across 27 major providers including AWS, Google Cloud, Azure, Meta, Apple, Oracle, and more.

**Live Demo:** [Coming Soon]

## ✨ Features

### 🗺️ Interactive Map
- **107 Datacenters** from 24 providers across the USA
- **Real-time Search** - Find datacenters by name, provider, city, or state
- **Smart Filters** - Filter by provider type, capacity, PUE, renewable energy
- **Comparison Mode** - Compare up to 3 datacenters side-by-side
- **Network Connections** - Visualize provider backbone and peering (hover on markers)
- **Shareable URLs** - Share filtered views with URL parameters

### 📊 Data & Analytics
- **Statistics Panel** - Total capacity, average PUE, renewable percentage, geographic coverage
- **Export Data** - Download filtered datacenter list as CSV or JSON
- **Detailed Tooltips** - Hover for capacity, PUE, renewable status, availability zones

### 🎨 User Experience
- **Dark Theme** - Modern dark zinc aesthetic optimized for readability
- **Mobile Responsive** - Full-featured experience on phones and tablets
- **Keyboard Shortcuts** - Power user features (press `?` to see all shortcuts)
- **Accessibility** - WCAG AA compliant with screen reader support

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Map**: Mapbox GL JS + react-map-gl
- **State Management**: Zustand
- **Notifications**: Sonner (toast library)

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Mapbox account (free tier works)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Tyler-Irving/where-is-my-data.git
cd where-is-my-data
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Mapbox token:
```bash
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

Get your token at: https://account.mapbox.com/access-tokens/

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎮 Usage

### Map Interactions
- **Click markers** - View datacenter details
- **Hover markers** - See provider connections
- **Zoom** - Use +/- buttons or scroll
- **Pan** - Click and drag

### Search & Filters
- **Search** - Press `Cmd/Ctrl + K` or click search icon
- **Filters** - Click filter dropdowns in top bar
- **Clear** - Reset all filters with one click

### Comparison
1. Click "Compare" on any datacenter tooltip
2. Select 2-3 datacenters
3. Click "View Comparison" in sticky footer
4. Or press `C` keyboard shortcut

### Keyboard Shortcuts
- `Cmd/Ctrl + K` - Focus search
- `C` - Open comparison (when 2+ selected)
- `+` / `-` - Zoom in/out
- `Esc` - Close modals
- `?` - Show all shortcuts

## 📊 Data Sources

All datacenter data is compiled from official provider sources:

- **AWS**: Direct Connect locations
- **Google Cloud**: Cloud regions and zones
- **Azure**: ExpressRoute metros
- **Meta, Apple, xAI**: Official announcements
- **Colocation Providers**: Public facility data
- **PeeringDB**: Network infrastructure data

Data last updated: **2026-02-20**

## 🏗️ Project Structure

```
where-is-my-data/
├── app/
│   ├── page.tsx                      # Main application
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   └── api/
│       └── datacenters/route.ts      # API endpoint
├── components/
│   ├── map/
│   │   ├── MapContainer.tsx          # Mapbox map
│   │   ├── DatacenterMarkers.tsx     # Marker rendering
│   │   ├── DatacenterTooltip.tsx     # Hover tooltips
│   │   ├── FilterBar.tsx             # Filter controls
│   │   ├── SearchBar.tsx             # Search input
│   │   ├── MapControls.tsx           # Zoom buttons
│   │   └── MapLegend.tsx             # Provider legend
│   ├── comparison/
│   │   ├── ComparisonFooter.tsx      # Sticky footer
│   │   └── DatacenterThumbnail.tsx   # Thumbnail cards
│   ├── modals/
│   │   ├── ComparisonModal.tsx       # Comparison table
│   │   └── KeyboardShortcutsModal.tsx
│   └── layout/
│       ├── Header.tsx                # Top navigation
│       └── Footer.tsx                # Footer with credits
├── lib/
│   ├── data/
│   │   ├── datacenters.json          # 107 datacenters
│   │   └── providers.json            # 24 providers
│   └── utils/
│       ├── providerColors.ts         # Color palette
│       ├── colorBrightness.ts        # Accessibility
│       └── markerOffset.ts           # Overlap handling
├── store/
│   ├── datacenterStore.ts            # Datacenter state
│   ├── filterStore.ts                # Filter state
│   ├── mapStore.ts                   # Map viewport
│   └── comparisonStore.ts            # Comparison state
├── hooks/
│   └── useUrlSync.ts                 # URL parameter sync
└── types/
    └── datacenter.ts                 # TypeScript types
```

## 🎨 Design Philosophy

- **Dark First**: Optimized for dark mode (zinc color palette)
- **Data Density**: Show maximum information without clutter
- **Performance**: 60 FPS with 100+ markers visible
- **Accessibility**: Keyboard navigation, screen readers, high contrast
- **Mobile First**: Responsive design from 375px to 4K displays

## 🔧 Configuration

### Map Bounds
- USA only: Southwest (California/Texas) to Northeast (Maine)
- Zoom range: 3 (full USA) to 12 (city level)

### Provider Colors
Each provider has a distinct color for easy identification:
- AWS: Orange (#FF9900)
- Google Cloud: Light Blue (#4285F4)
- Azure: Blue (#0089D6)
- Meta: Facebook Blue (#1877F2)
- Apple: Dark Gray (#555555)
- xAI: Black (#000000) with auto-lightening
- [See all 24 in providerColors.ts]

## 📈 Performance

- **Initial Load**: <2s on 3G
- **Map Render**: 60 FPS with all markers
- **Search**: Real-time with 0ms lag
- **Bundle Size**: ~450KB gzipped
- **Lighthouse Score**: 95+ (Performance, Accessibility)

## 🚧 Roadmap

### Planned Features
- [ ] Network Connectivity Map (provider backbone visualization)
- [ ] Latency Calculator (estimate between datacenters)
- [ ] Cost Estimator (compare regional pricing)
- [ ] Historical Timeline (datacenter growth over time)
- [ ] Compliance Map (GDPR, HIPAA, SOC 2 indicators)
- [ ] API Access (RESTful API for datacenter data)

### Maybe Later
- [ ] User submissions (with moderation)
- [ ] Live status integration (outage tracking)
- [ ] 3D globe view
- [ ] Mobile app (PWA)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Data Corrections
If you spot incorrect datacenter data, please open an issue with:
- Datacenter name
- What's wrong
- Source for correction (official link preferred)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Credits

- **Built by**: [Tyler Irving](https://tyler-irving.github.io)
- **Map Tiles**: [Mapbox](https://www.mapbox.com/)
- **Data Sources**: AWS, Google Cloud, Azure, PeeringDB, and official provider docs
- **Icons**: Custom SVG designs

## 🔗 Links

- **Portfolio**: https://tyler-irving.github.io
- **GitHub**: https://github.com/Tyler-Irving/where-is-my-data
- **Issues**: https://github.com/Tyler-Irving/where-is-my-data/issues

---

**Made with ❤️ for cloud architects, DevOps engineers, and datacenter enthusiasts**
