# Morning checklist — Catto Compass

## ✅ What's done overnight

### Repo
- 🔗 GitHub: https://github.com/cattodata/catto-compass (private)
- Branch: `main` · Commits: 6
- 5,801 LOC across src + api + e2e + server

### Azure resources (all in `personal-ai-rg`)
| Resource | Type | Region | Cost |
|---|---|---|---|
| `cattocompass` | App Service (Node 22) | southeastasia (B1 plan) | $0 incremental (shares plan with cattobot) |
| `cattocompass-openai` | Azure OpenAI | australiaeast | ~$0.0002/campaign |
| `cattocompass-github-deploy` | Service Principal (OIDC) | — | $0 |
| Federated credential | Trusts main branch pushes | — | $0 |

### What works
- ✅ Live AI vision via Azure OpenAI gpt-4.1-nano (verified locally)
- ✅ Real shops from OSM Overpass (~20 Chatswood eateries)
- ✅ Real Open-Meteo weather + ABS Census demographics
- ✅ Smart Pick + Competitor Radar + Demand Forecast
- ✅ PWA installable + service worker offline cache
- ✅ Code splitting (75KB initial JS, lazy heavy chunks)
- ✅ 20/20 unit tests + Playwright e2e specs
- ✅ HTTP Basic Auth gate: password `***REDACTED***`
- ✅ Dark/light theme + a11y polish

## ⚠️ What you need to do (60 sec total)

### 1. Add DNS records in Cloudflare (1 min)
Go to https://dash.cloudflare.com → cattodata.com → DNS → Add record:

| Type  | Name                | Content                                                            | Proxy   |
|-------|---------------------|--------------------------------------------------------------------|---------|
| CNAME | `cattocompass`      | `cattocompass.azurewebsites.net`                                   | DNS only ☁️ off |
| TXT   | `asuid.cattocompass`| `***REDACTED-AZURE-DOMAIN-VERIFICATION-ID***` | (n/a) |

### 2. Bind custom domain + SSL (1 min, after DNS propagates)
```bash
RG=personal-ai-rg
az webapp config hostname add --webapp-name cattocompass -g $RG --hostname cattocompass.cattodata.com
az webapp config ssl create -g $RG --name cattocompass --hostname cattocompass.cattodata.com
THUMB=$(az webapp config ssl list -g $RG --query "[?subjectName=='cattocompass.cattodata.com'].thumbprint" -o tsv)
az webapp config ssl bind -g $RG --name cattocompass --certificate-thumbprint $THUMB --ssl-type SNI
```

## 🔗 Live URLs

- Default: **https://cattocompass.azurewebsites.net** (works once deploy succeeds)
- Custom: **https://cattocompass.cattodata.com** (after step 1+2)
- Login: any username, password `***REDACTED***`

## 🔐 Update password later

```bash
az webapp config appsettings set -g personal-ai-rg -n cattocompass \
  --settings BASIC_AUTH_PASSWORD=newpassword --output none
```
App auto-restarts ~10s.

## 📦 Tech summary

| Layer | Choice |
|---|---|
| Frontend | Vite + React 19 + TypeScript |
| Map | Leaflet + OSM/CartoDB (no Google billing) |
| Backend | Express on Node 22 (Azure App Service) |
| AI | Azure OpenAI gpt-4.1-nano (vision + multilingual) |
| Auth gate | HTTP Basic Auth (Express middleware) |
| Tests | Vitest 20/20 unit + Playwright e2e |
| CI/CD | GitHub Actions OIDC → Azure CLI deploy |
| PWA | vite-plugin-pwa (workbox SW) |

## 📁 Important files

- [DEPLOY.md](DEPLOY.md) — full deployment guide
- [README.md](README.md) — architecture + forecast model docs
- `.env.local` — Azure keys (gitignored, on local machine)
- `.github/workflows/deploy.yml` — CI/CD
- `server/index.mjs` — Express prod server
- `server/api-claude.mjs` — LLM proxy (Azure OpenAI + Anthropic fallback)
