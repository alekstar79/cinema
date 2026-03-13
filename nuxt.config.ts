import { defineNuxtConfig } from 'nuxt/config'

const isGenerate = process.argv.includes('generate')

export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  app: {
    baseURL: isGenerate ? '/cinema/' : '/'
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
