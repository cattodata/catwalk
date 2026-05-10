/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e/**', '.vercel/**'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules', 'dist', 'e2e/**', '**/*.config.*', 'src/test/**'],
    },
  },
})
