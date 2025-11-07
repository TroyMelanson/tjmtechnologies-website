import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ This config ensures proper building for Azure Static Web Apps
export default defineConfig({
  plugins: [react()],
  root: '.', // project root (current folder)
  base: './', // ensures all assets are relative (important for subpath deployments)
  build: {
    outDir: 'dist', // 👈 Azure expects the built site here
    emptyOutDir: true, // clears old builds before each new one
    sourcemap: false, // optional, can set true for debugging
    rollupOptions: {
      output: {
        manualChunks: undefined, // disables aggressive code splitting for simplicity
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
