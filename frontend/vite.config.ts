import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react(), tailwindcss()],
    // Only use base URL in production
    base: isProduction ? '/static/frontend/' : '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/media': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
        '/admin': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 3000,
      host: true,
    }
  }
})