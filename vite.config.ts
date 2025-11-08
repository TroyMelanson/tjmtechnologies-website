import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ This ensures relative asset paths work correctly on Azure
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
})
