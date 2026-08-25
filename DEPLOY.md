# CatWalk — deployment

## Live

- **App:** https://cattocompressv2.azurewebsites.net
- **Health:** https://cattocompressv2.azurewebsites.net/api/health

## How it deploys

```
push to main
      │
      ▼
GitHub Actions (.github/workflows/deploy.yml)
      │  npm ci → typecheck → unit tests → vite build
      │  zip → Azure Storage → app settings → restart
      ▼
Azure App Service  (cattocompressv2, personal-ai-rg)
      │  Express 5 on Node 20 (server/index.mjs)
      │  • serves the built SPA from dist/
      │  • POST /api/claude*  → LLM campaign generation
      │  • GET  /api/health   → deploy gate polls this
      ▼
Supabase (Postgres + RLS)   ·   Live public data (ABS · Open-Meteo · Overpass · Google Places)
```

Auth to Azure uses **OIDC federated credentials** (`azure/login@v2`) — no publish profile or
long-lived secret is stored in the repo. The job polls `/api/health` after restart and fails
if the app does not come back.

## Environment

Every variable is listed in [`.env.example`](.env.example) with an empty value.
`VITE_*` variables are build-time and ship to the browser — only the Supabase **anon** key
belongs there, and row-level security is what actually protects the data. Server-side keys
(LLM providers, service role) are set as App Service application settings and never committed.

Optional: setting `BASIC_AUTH_PASSWORD` puts the whole app behind a cookie + basic-auth gate
(`server/index.mjs`). It is unset on the live app.

## Run locally

```bash
cp .env.example .env.local
npm ci
npm run dev          # Vite dev server
npm start            # or: production Express server against a built dist/
```

## Checks

```bash
npm run typecheck
npm run lint
npm test             # Vitest unit
npm run test:e2e     # Playwright
```
