import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/RowState/', // GitHub Pages base path
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'videojs': ['video.js', 'videojs-youtube'],
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Suppress warnings for video.js
  },
})
