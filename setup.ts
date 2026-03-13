import { vi } from 'vitest'

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      apiBaseUrl: '/api'
    }
  })
}))
