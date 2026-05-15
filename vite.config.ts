import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Tiny dev-only plugin: routes /api/* to the Vercel-style handlers in api/
 * so the SPA gets the same shape as production. Handlers gracefully return
 * stub data when API keys are missing.
 */
function devApiHandlers(): Plugin {
  return {
    name: 'cattocompressv2-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next()
        const route = req.url.replace(/^\/api\//, '').replace(/\?.*$/, '')
        const allowed = new Set([
          'claude-text',
          'resend',
          'claude',
          'claude-ab',
          'claude-policy',
          'places',
          'nominatim',
        ])
        if (!allowed.has(route)) return next()
        try {
          const mod = await server.ssrLoadModule(`/api/${route}.ts`)
          const handler = mod.default
          if (typeof handler !== 'function') return next()
          let raw = ''
          req.on('data', (c: Buffer) => (raw += c.toString()))
          req.on('end', async () => {
            try {
              const body = raw ? JSON.parse(raw) : undefined
              const adaptedReq = Object.assign(req, { body })
              const adaptedRes = Object.assign(res, {
                status(code: number) {
                  res.statusCode = code
                  return adaptedRes
                },
                json(payload: unknown) {
                  res.setHeader('content-type', 'application/json')
                  res.end(JSON.stringify(payload))
                },
              })
              await handler(adaptedReq, adaptedRes)
            } catch (err) {
              res.statusCode = 500
              res.setHeader('content-type', 'application/json')
              res.end(JSON.stringify({ error: 'dev-handler-failed', message: String(err) }))
            }
          })
        } catch {
          next()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    devApiHandlers(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/cattodata-logo.png', 'assets/cattodata-brand.png'],
      manifest: {
        name: 'Catto Compass · Chatswood',
        short_name: 'Catto',
        description:
          'Walk Chatswood. Earn rewards. Help shops thrive. AI-powered civic engagement for Willoughby City Council.',
        theme_color: '#FAF7F0',
        background_color: '#FAF7F0',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['lifestyle', 'business', 'navigation'],
        icons: [
          {
            src: '/assets/cattodata-logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/assets/cattodata-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'open-meteo', expiration: { maxAgeSeconds: 15 * 60 } },
          },
          {
            urlPattern: /^https:\/\/overpass-api\.de\//,
            handler: 'CacheFirst',
            options: { cacheName: 'overpass', expiration: { maxAgeSeconds: 24 * 60 * 60 } },
          },
          {
            urlPattern: /^https:\/\/services-ap1\.arcgis\.com\//,
            handler: 'CacheFirst',
            options: { cacheName: 'abs-arcgis', expiration: { maxAgeSeconds: 7 * 24 * 60 * 60 } },
          },
          {
            urlPattern: /^https:\/\/(tile\.openstreetmap\.org|atlas\.microsoft\.com)\//,
            handler: 'CacheFirst',
            options: { cacheName: 'map-tiles', expiration: { maxEntries: 300, maxAgeSeconds: 7 * 24 * 60 * 60 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxAgeSeconds: 365 * 24 * 60 * 60 } },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-leaflet') || id.includes('/leaflet/')) return 'vendor-map'
          if (id.includes('@supabase') || id.includes('@tanstack')) return 'vendor-data'
          if (id.includes('react-dom') || id.includes('react-router')) return 'vendor-react'
          return undefined
        },
      },
    },
  },
})
