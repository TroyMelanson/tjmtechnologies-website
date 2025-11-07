import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.', // base path for your app
  build: {
    outDir: 'dist', // ✅ build into /Apps/carehome-suite/dist
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './', // ✅ ensure relative paths work in Azure
})

