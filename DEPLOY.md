# Catto Compass — Deployment Guide

## Live URL
- **Default:** https://cattocompass.azurewebsites.net (running now)
- **Custom (after DNS):** https://cattocompass.cattodata.com
- **Password:** `***REDACTED***` (any username)

## Architecture

```
GitHub repo (cattodata/catto-compass, private)
        │ push to main
        ▼
GitHub Actions (.github/workflows/deploy.yml)
        │ npm ci → typecheck → tests → build → zip
        ▼
Azure App Service (cattocompass on personal-ai-plan B1)
        │ Express server (server/index.mjs) on Node 22
        │ • Serves dist/ static SPA
        │ • POST /api/claude → Azure OpenAI gpt-4.1-nano
        │ • HTTP Basic Auth gate (BASIC_AUTH_PASSWORD)
        ▼
Azure OpenAI (cattocompass-openai, australiaeast)
        │ deployment: gpt-mini = gpt-4.1-nano
```

**Cost:** $0 incremental (shares B1 plan with cattobot, same $13/mo)

## Custom domain setup (cattocompass.cattodata.com)

### Step 1: Add DNS records in Cloudflare

Go to https://dash.cloudflare.com → cattodata.com → DNS:

| Type  | Name                | Content                                                              | Proxy   |
|-------|---------------------|----------------------------------------------------------------------|---------|
| CNAME | `cattocompass`      | `cattocompass.azurewebsites.net`                                     | DNS only ☁️❌ |
| TXT   | `asuid.cattocompass` | `***REDACTED-AZURE-DOMAIN-VERIFICATION-ID***` | (n/a)   |

> ⚠️ Important: Proxy must be **DNS only** (grey cloud), not orange. Azure verifies via direct CNAME.

### Step 2: After DNS propagates (5-30 min), bind domain to App Service

```bash
RG=personal-ai-rg
APP=cattocompass
DOMAIN=cattocompass.cattodata.com

# Bind hostname
az webapp config hostname add \
  --webapp-name $APP --resource-group $RG --hostname $DOMAIN

# Issue free SSL cert (App Service Managed Certificate)
az webapp config ssl create -g $RG --name $APP --hostname $DOMAIN

# Bind cert via SNI
THUMBPRINT=$(az webapp config ssl list -g $RG --query "[?subjectName=='$DOMAIN'].thumbprint" -o tsv)
az webapp config ssl bind -g $RG --name $APP --certificate-thumbprint $THUMBPRINT --ssl-type SNI
```

After this, https://cattocompass.cattodata.com works with valid HTTPS cert.

## Updating the password

```bash
NEW=newpasswordhere
az webapp config appsettings set -g personal-ai-rg -n cattocompass \
  --settings BASIC_AUTH_PASSWORD=$NEW --output none
```

App auto-restarts within ~10s.

## Updating Azure OpenAI key (if rotated)

```bash
RG=personal-ai-rg
APP=cattocompass
OAI=cattocompass-openai

KEY=$(az cognitiveservices account keys list -g $RG -n $OAI --query key1 -o tsv)
az webapp config appsettings set -g $RG -n $APP \
  --settings AZURE_OPENAI_API_KEY=$KEY --output none
```

## Deployment trigger

Any push to `main` triggers `.github/workflows/deploy.yml` automatically.
Manual trigger:

```bash
gh workflow run deploy.yml --repo cattodata/catto-compass --ref main
gh run watch --repo cattodata/catto-compass
```

## Logs

```bash
# Live tail
az webapp log tail -g personal-ai-rg -n cattocompass

# One-shot snapshot
az webapp log download -g personal-ai-rg -n cattocompass --log-file /tmp/logs.zip
```

Or via Azure Portal → cattocompass → Log stream.

## Adding more apps to the same plan

Plan capacity (B1): 1 vCPU, 1.75 GB RAM. Already hosts:
- `cattobot` (Node 22, southeastasia)
- `cattocompass` (Node 22, southeastasia)

To add a new app sharing the same plan (zero $ incremental):

```bash
az webapp create -g personal-ai-rg -p personal-ai-plan -n NEW_APP --runtime "NODE:22-lts"
```

Each app gets its own subdomain (`NEW_APP.azurewebsites.net`) and can have its own custom domain via the same pattern.

## When to upgrade the plan

Current B1 (~$13/mo) handles ~5-10 small apps with low traffic. Watch:
- Azure Portal → cattocompass → Metrics → CPU, Memory
- If CPU > 80% sustained or Memory > 80% → upgrade to B2 ($26/mo, 2 vCPU/3.5GB) or S1 ($73/mo, autoscale)
