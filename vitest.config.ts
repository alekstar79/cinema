import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'], // 'text' prints summary to stdout
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      '~': __dirname,
      '@': __dirname,
    },
  },
})
