// Express server — serves Vite static build + /api/claude proxy.
// Used in production on Azure App Service (cattocompass.azurewebsites.net).

import express from 'express'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createHmac, timingSafeEqual } from 'node:crypto'
import claudeHandler from './api-claude.mjs'
import eventsHandler from './api-events.mjs'
import { renderLoginPage } from './login-page.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')

const app = express()
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: false, limit: '64kb' }))

const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || ''
const COOKIE_SECRET = process.env.COOKIE_SECRET || BASIC_AUTH_PASSWORD || 'catto-compass-default-rotate-me'
const AUTH_COOKIE = 'cc_auth'
const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function signToken(password) {
  // HMAC the password — token is opaque, can't reverse-engineer the password from it
  return createHmac('sha256', COOKIE_SECRET).update(password).digest('hex')
}

function isValidToken(token) {
  if (!token || typeof token !== 'string') return false
  const expected = signToken(BASIC_AUTH_PASSWORD)
  if (token.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}

function parseCookie(req, name) {
  const raw = req.headers.cookie
  if (!raw) return null
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

// Public endpoints — no auth needed
const ALWAYS_PUBLIC = new Set([
  '/api/health',
  '/api/events',
  '/manifest.webmanifest',
  '/sw.js',
  '/registerSW.js',
  '/login',
  '/favicon.ico',
])
function isPublicPath(p) {
  if (ALWAYS_PUBLIC.has(p)) return true
  if (p.startsWith('/workbox-')) return true
  if (p.startsWith('/assets/')) return true
  return false
}

// ---- Auth gate ----
if (BASIC_AUTH_PASSWORD) {
  app.use((req, res, next) => {
    if (isPublicPath(req.path)) return next()

    // Cookie auth (mobile-friendly primary path)
    const token = parseCookie(req, AUTH_COOKIE)
    if (token && isValidToken(token)) return next()

    // HTTP Basic Auth fallback (curl, scripts)
    const auth = req.headers.authorization || ''
    if (auth.startsWith('Basic ')) {
      const decoded = Buffer.from(auth.slice(6), 'base64').toString()
      const password = decoded.split(':')[1] ?? ''
      if (password === BASIC_AUTH_PASSWORD) return next()
    }

    // Browser GET requests → render login page (no Basic Auth dialog)
    if (req.method === 'GET' && (req.headers.accept || '').includes('text/html')) {
      const redirect = req.originalUrl !== '/' ? req.originalUrl : '/'
      return res.status(401).type('html').send(renderLoginPage(false, redirect))
    }

    // API/JSON clients → still serve Basic Auth header
    res.setHeader('WWW-Authenticate', 'Basic realm="Catto Compass"')
    res.status(401).type('text/plain').send('Authentication required')
  })
}

// ---- Login form POST ----
app.post('/login', (req, res) => {
  const password = String(req.body?.password ?? '')
  const redirect = String(req.body?.redirect ?? '/')
  // Sanitize redirect to prevent open redirect
  const safeRedirect = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/'

  if (password === BASIC_AUTH_PASSWORD) {
    const token = signToken(password)
    const isProd = req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https'
    const cookieParts = [
      `${AUTH_COOKIE}=${encodeURIComponent(token)}`,
      `Max-Age=${Math.floor(COOKIE_MAX_AGE_MS / 1000)}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
    ]
    if (isProd) cookieParts.push('Secure')
    res.setHeader('Set-Cookie', cookieParts.join('; '))
    return res.redirect(302, safeRedirect)
  }

  res.status(401).type('html').send(renderLoginPage(true, safeRedirect))
})

// ---- Logout ----
app.post('/logout', (_req, res) => {
  res.setHeader('Set-Cookie', `${AUTH_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`)
  res.redirect(302, '/login')
})
app.get('/logout', (_req, res) => {
  res.setHeader('Set-Cookie', `${AUTH_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`)
  res.redirect(302, '/login')
})

// CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// API
app.post('/api/claude', claudeHandler)
app.get('/api/events', eventsHandler)
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }))

// Static SPA + fallback
app.use(express.static(distDir, { maxAge: '1h', etag: true }))
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  res.sendFile(join(distDir, 'index.html'))
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`[cattocompass] listening on :${port}`)
  console.log(`[cattocompass] auth: ${BASIC_AUTH_PASSWORD ? 'cookie+basic enabled' : 'OPEN (no password)'}`)
  console.log(`[cattocompass] LLM: ${
    process.env.AZURE_OPENAI_ENDPOINT
      ? 'Azure OpenAI (' + process.env.AZURE_OPENAI_DEPLOYMENT + ')'
      : process.env.ANTHROPIC_API_KEY
        ? 'Anthropic'
        : 'NONE — set env vars'
  }`)
})
