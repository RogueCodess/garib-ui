import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import frappeUIPlugin from 'frappe-ui/vite'
import path from 'path'

export default defineConfig({
  plugins: [vue(), frappeUIPlugin({ frappeProxy: false })],
  base: '/assets/garib_ui/garib/',
  build: {
    outDir: path.resolve(__dirname, '../garib_ui/public/garib'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
        assetFileNames: 'index.[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://frappe.167.88.38.183.sslip.io',
        changeOrigin: true,
        secure: false,
      },
      '^/assets/(?!garib_ui)': {
        target: 'https://frappe.167.88.38.183.sslip.io',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
