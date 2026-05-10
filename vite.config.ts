import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
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
            urlPattern: /^https:\/\/[a-d]\.basemaps\.cartocdn\.com\//,
            handler: 'CacheFirst',
            options: { cacheName: 'map-tiles', expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 } },
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
