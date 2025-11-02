import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb (default is 500kb)
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Stellar SDK into its own chunk (it's quite large)
          'stellar-sdk': ['@stellar/stellar-sdk'],
          // Split React and React-DOM into their own chunk
          'react-vendor': ['react', 'react-dom']
        }
      }
    }
  }
})

