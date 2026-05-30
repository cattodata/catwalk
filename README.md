# CatWalk

> Walk Willoughby. Earn rewards. Help shops thrive. See the city move — live.

A civic-engagement web app pitched to **Willoughby City Council** on 16 May 2026, built around *Our Future Willoughby 2036*.

One app, three lenses on the same data:

- **Walker** — residents pick a partner shop, walk there with GPS check-in, earn points and log CO₂ saved.
- **Owner** — shop owners upload a product photo and get an AI marketing campaign in English / 中文 / 한국어.
- **Council** — a live aggregate dashboard: walks now, CO₂ saved, top streets, and 2036-outcome alignment.

A **Radar** surface layers proactive business outreach on top of the Council view.

## Why CatWalk

Short trips still happen by car — even when the walk is only a few minutes. Council has no live picture of how local high streets are doing. CatWalk turns each verified walk into rewards for the resident, foot traffic for the shop, and an anonymised aggregate signal for Council.

## What's under the hood (high level)

A modern React single-page app backed by Supabase (Postgres + Realtime + row-level security) and a small server layer for AI and integrations. Live data from OpenStreetMap, ABS Census, Open-Meteo, Google Places and Willoughby's events feeds. AI campaigns generated with Azure OpenAI / Claude Sonnet. Runs as a Progressive Web App so residents can install it like a native app. Deployed on Azure App Service.

Council surfaces are aggregate-only — never an individual walker's identity.

## Council pitch alignment — *Our Future Willoughby 2036*

- **Green city · Net Zero** — every walk logs CO₂ saved, surfaced live on the Council dashboard.
- **Connected & inclusive** — Owner campaigns generated in English, Chinese and Korean to reflect Chatswood's community.
- **Liveable & vibrant CBD** — walker incentives + Council Radar steer foot traffic to local shops.

## Status

Pitched 16 May 2026 to Willoughby City Council. Live on Azure App Service; URLs shared privately with stakeholders. A small public twin is available for embedding on request.

---

Built for Willoughby City Council · by Cattodata.
