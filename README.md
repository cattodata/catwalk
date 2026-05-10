# Catto Compass

> Walk Chatswood. Earn rewards. Help shops thrive.
> AI-powered civic-engagement web app for the Chatswood Hackathon (16 May 2026), aligned with **Our Future Willoughby 2036**.

A production-ready React SPA that combines **GPS-verified walk-to-earn** with an **AI marketing copilot** for local shop owners — built on real public data (no fake numbers).

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| **Build** | Vite 8 | Fast HMR, optimized prod build |
| **Framework** | React 19 | Industry standard |
| **Language** | TypeScript 6 | Type-safe data layer |
| **Styling** | Plain CSS + tokens | No Tailwind — keeps brand cute factor |
| **State** | `useState` + custom hooks + `@tanstack/react-query` | No Redux needed |
| **Routing** | `react-router-dom` (installed for V2 multi-page) | Currently SPA single page |
| **Map** | Leaflet + OpenStreetMap (CartoDB Positron tiles) | Free, no key, real tiles |
| **Backend** | Vercel Functions (Node 20 serverless) | Same repo, simple deploy |
| **Database** | Supabase (Postgres + Anonymous Auth + Realtime + Storage) | Sydney region |
| **Hosting** | Vercel | Git push → live URL |

## Real data sources (no faking)

| Feature | Source | Status |
|---|---|---|
| Live weather (temp, code, precipitation) | **Open-Meteo** | ✅ Browser fetch, no key |
| Live competitor count (cafes/restaurants/bakeries) | **OSM Overpass** | ✅ Browser fetch, 24h cache |
| Demographics (population, ancestry %) | **ABS ArcGIS Census 2021** | ✅ Browser fetch, no key |
| Walk verification | **Browser Geolocation API** | ✅ 100m geofence + Demo mode |
| AI vision + multilingual generation | **Anthropic Claude Sonnet 4** | ✅ Vercel Function proxy |
| Walks / points / aggregate stats | **Supabase Postgres + Realtime** | ✅ RLS-secured |
| Station daily taps | TfNSW Aug 2024 monthly avg | ⚠️ Pre-baked (no real-time API exists) |
| Foot-traffic heatmap | Predicted from TfNSW pattern | ⚠️ No public Google Popular Times API |

## Quick start

```bash
npm install
cp .env.example .env.local
# fill in ANTHROPIC_API_KEY + VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev
# open http://localhost:5173
```

App boots even without env vars — Live AI falls back to mock campaigns, walks fall back to localStorage.

## Scripts

```bash
npm run dev          # vite dev server (HMR)
npm run typecheck    # tsc -b --noEmit
npm run build        # tsc + vite build → dist/
npm run preview      # serve dist/ locally
npm run lint         # eslint
npm run format       # prettier
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel link
# Vercel dashboard → Settings → Environment Variables:
#   ANTHROPIC_API_KEY        (server-only)
#   VITE_SUPABASE_URL        (browser-safe)
#   VITE_SUPABASE_ANON_KEY   (browser-safe)
vercel --prod
```

The `vercel.json` pins region to `syd1` (Sydney) for low-latency in Australia.

## Supabase setup

1. Create project at https://supabase.com (region: `ap-southeast-2` Sydney)
2. SQL Editor → run `supabase/migrations/0001_initial_schema.sql`
3. SQL Editor → run `supabase/seed.sql` (seed Chatswood shops)
4. Authentication → Settings → enable **Anonymous Sign-Ins**
5. Copy URL + anon key to env

## Project structure

```
catto-compass/
├── api/
│   ├── claude.ts            # POST /api/claude — Anthropic vision proxy
│   └── nominatim.ts         # GET  /api/nominatim — OSM geocoding proxy
├── public/assets/           # Logos (Cattodata + Willoughby Council)
├── src/
│   ├── components/          # Header, RealMap (Leaflet), WalkPanel, ShopPanel, CouncilPanel, …
│   ├── hooks/               # useWeather, useGeolocation, useWalkSession, useCouncilStats, …
│   ├── lib/                 # openMeteo, overpass, absArcgis, claude, supabase, geofence, insights
│   ├── data/                # shops, transport, landmarks, campaigns (mock), council
│   ├── types/               # shop, campaign, walk, weather
│   ├── config/chatswood.ts  # Multi-tenant config (V2: add /pilot/[city])
│   ├── styles/styles.css    # Hand-written CSS (no Tailwind)
│   ├── App.tsx              # Composition root
│   └── main.tsx             # ReactDOM mount + QueryClient + Router
├── supabase/
│   ├── migrations/          # SQL schema with RLS + SECURITY DEFINER aggregates
│   └── seed.sql
├── index.html
├── vercel.json              # Sydney region + function timeouts + CORS
└── package.json
```

## Three modes

1. **🚶 Walk to Earn** — locals pick a shop on the live map, walk there with GPS verification, earn points + log CO₂ savings to Supabase
2. **🛍️ Shop Booster** — owners upload a product photo → Claude vision reads it → reactive insights from real weather/time/competition → 3-language campaign (EN / 中文 / 한국어)
3. **📊 Council View** — real-time aggregate dashboard via Supabase Realtime: every walk by a real user updates the dashboard live

## Scale-readiness

- **CDN-distributed SPA** on Vercel Edge — infinite read scale
- **Vercel Functions** auto-scale (Sydney region)
- **Supabase Free → Pro** path: 500MB → 8GB DB, 50K → 100K MAU
- **Composite index** `walks(user_id, created_at desc)` for fast per-user queries
- **SECURITY DEFINER aggregate RPC** for council dashboard — bypasses RLS but only exposes aggregates
- **Multi-tenant config layer** at `src/config/chatswood.ts` — V2 adds Burwood, Parramatta as separate config files
- **Anonymous auth** with V2 upgrade path to email/social via `auth.linkIdentity` (no data loss)
- **TanStack Query** for API caching + dedup
- **`react-router-dom`** installed for V2 multi-page (`/shop/admin`, `/council/admin`, `/pilot/[city]`)

## Council pitch alignment

Every feature maps to an outcome in *Our Future Willoughby 2036* (see footer):
- **Outcome 1 (Green city · Net Zero 2025)** → CO₂ logged per walk
- **Outcome 2 (Connected & inclusive)** → trilingual campaigns (EN/中文/한국어)
- **Outcome 4 (Prosperous & vibrant CBD)** → walk multipliers steer foot-traffic to underserved streets

Built for the Chatswood Hackathon · 16 May 2026 · by Cattodata.
