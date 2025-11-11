import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'RAD Error Decoder',
        short_name: 'RAD Decoder',
        description: 'Décodez rapidement les erreurs de plan de vol EUROCONTROL',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-192x192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icon-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['utilities', 'productivity'],
        shortcuts: [
          {
            name: 'Recherche rapide',
            short_name: 'Recherche',
            description: 'Rechercher dans le RAD',
            url: '/',
            icons: [{ src: 'icon-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        // 🔧 Augmenter la limite à 20 MB (ou plus si nécessaire)
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, // 20 MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}']
        // runtimeCaching commenté pour le développement local
        // À configurer avec votre vrai compte GitHub lors du déploiement
        // runtimeCaching: [
        //   {
        //     urlPattern: /^https:\/\/paneuropeennefiles-cmyk\.github\.io\/rad-error-decoder\/.*/i,
        //     handler: 'CacheFirst',
        //     options: {
        //       cacheName: 'rad-cache',
        //       expiration: {
        //         maxEntries: 10,
        //         maxAgeSeconds: 60 * 60 * 24 * 30 // 30 jours
        //       },
        //       cacheableResponse: {
        //         statuses: [0, 200]
        //       }
        //     }
        //   }
        // ]
      }
    })
  ],
  
  // Configuration pour GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/rad-error-decoder/' : '/',
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-search': ['fuse.js'],
          'vendor-db': ['dexie', 'dexie-react-hooks']
        }
      }
    }
  },
  
  server: {
    port: 5173,
    open: true
  },
  
  preview: {
    port: 4173
  }
})
