import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://172.238.14.142',
        changeOrigin: true,
      },
      '/download': {
        target: 'http://172.238.14.142',
        changeOrigin: true,
      }
    },
    watch: {
      usePolling: false,
    }
  }
})
