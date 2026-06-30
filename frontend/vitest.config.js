import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // frappe-ui is a Vue runtime library that cannot run in Vitest's jsdom
      // environment (missing internal modules). Pure helpers (filterItems etc.)
      // don't use it at runtime, so we stub it out for tests.
      'frappe-ui': path.resolve(__dirname, 'src/resources/__mocks__/frappe-ui.js'),
    },
  },
})
