import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // A new deployment installs in the background and takes over on the next open.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon-32x32.png', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        id: '/',
        name: 'The Halal Way',
        short_name: 'Halal Way',
        description: "Demo built from IFANCA's public content. Not an official IFANCA app.",
        lang: 'en-US',
        theme_color: '#0f6b55',
        background_color: '#f6f1e7',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        // Code, icons, and all data files are precached so every screen works offline after the first visit.
        // products.json is about 3 MB, so the size limit is raised to 4 MB.
        globPatterns: ['**/*.{js,css,html,svg,png,json,txt,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // OCR files are large and only needed for the Photo tab. Cache them when first used.
        // Article bodies (761 files, about 5 MB) are not installed up front. Each one is saved when first opened.
        globIgnores: ['tesseract/**', 'data/articles/**'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/data/articles/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'articles', expiration: { maxEntries: 800 } },
          },
          {
            // Recipe photos come from ifanca.org and are never stored by the service worker.
            urlPattern: ({ url }) => url.hostname.endsWith('ifanca.org'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/tesseract/'),
            handler: 'CacheFirst',
            options: { cacheName: 'ocr' },
          },
        ],
      },
    }),
  ],
})
