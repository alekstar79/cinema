import { defineNuxtConfig } from 'nuxt/config'

const isGenerate = false // process.argv.includes('generate')

export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  app: {
    baseURL: isGenerate ? '/cinema/' : '/',
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.png'
        }
      ]
    }
  },
  build: {
    transpile: ['vuetify']
  },
  vite: {
    ssr: {
      noExternal: ['vuetify']
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          }
        }
      }
    }
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: '/api',
    },
  },
  typescript: {
    typeCheck: false,
    strict: true,
  },
  nitro: {
    ...(isGenerate && {
      prerender: {
        crawlLinks: true,
        routes: ['/'],
        fallback: '404.html',
      },
    })
  }
})
