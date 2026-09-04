import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Routes all /api requests from frontend directly to your local FastAPI port
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})