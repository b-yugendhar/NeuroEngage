import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ml': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ml/, ''),
      },
      '/api/sample': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/api/predict': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/api/model-info': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      }
    }
  }
})
