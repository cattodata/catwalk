// Express server — serves Vite static build + /api/claude proxy.
// Used in production on Azure App Service (cattocompass.azurewebsites.net).
// In local dev, prefer `npm run dev` (Vite) + `vercel dev` (functions).

import express from 'express'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import claudeHandler from './api-claude.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')

const app = express()
app.use(express.json({ limit: '15mb' }))

// HTTP Basic Auth gate (team-only access until public launch).
// Set BASIC_AUTH_PASSWORD env var to enable. Empty = no auth.
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || ''
if (BASIC_AUTH_PASSWORD) {
  app.use((req, res, next) => {
    // Allow unauthenticated:
    //  - /api/health (monitoring)
    //  - manifest.webmanifest + service worker (browsers fetch no-credentials)
    //  - asset images (logo, council badge — referenced in PWA manifest)
    if (
      req.path === '/api/health' ||
      req.path === '/manifest.webmanifest' ||
      req.path === '/sw.js' ||
      req.path === '/registerSW.js' ||
      req.path.startsWith('/workbox-') ||
      req.path.startsWith('/assets/')
    ) {
      return next()
    }
    const auth = req.headers.authorization || ''
    if (auth.startsWith('Basic ')) {
      const decoded = Buffer.from(auth.slice(6), 'base64').toString()
      const password = decoded.split(':')[1] ?? ''
      if (password === BASIC_AUTH_PASSWORD) return next()
    }
    res.setHeader('WWW-Authenticate', 'Basic realm="Catto Compass team preview"')
    res.status(401).send('Authentication required')
  })
}

// CORS — same-origin in production but defensive
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// /api/claude — vision + multilingual generation
app.post('/api/claude', claudeHandler)

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }))

// Static SPA — serve dist/, fall back to index.html for client-side routing
app.use(express.static(distDir, { maxAge: '1h', etag: true }))
// Express 5 — use regex instead of '*' wildcard (which is no longer supported)
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  res.sendFile(join(distDir, 'index.html'))
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`[cattocompass] listening on :${port}`)
  console.log(`[cattocompass] LLM provider: ${
    process.env.AZURE_OPENAI_ENDPOINT
      ? 'Azure OpenAI (' + process.env.AZURE_OPENAI_DEPLOYMENT + ')'
      : process.env.ANTHROPIC_API_KEY
        ? 'Anthropic'
        : 'NONE — set env vars'
  }`)
})
