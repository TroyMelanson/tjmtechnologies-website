import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Explicitly set the project root to the current directory.
  // This prevents Vite from traversing up the directory tree and finding a
  // conflicting root-level vite.config.js.
  root: '.',
  build: {
    // This will now correctly output the built files to 'Apps/carehome-suite/dist',
    // which is what the Azure SWA deployment process expects.
    outDir: 'dist',
  },
});
