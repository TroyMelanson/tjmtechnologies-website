import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync } from 'fs';
// Fix: Import `fileURLToPath` to resolve `__dirname` in an ES module context.
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'copy-azure-config',
          apply: 'build',
          closeBundle() {
            try {
              cpSync('staticwebapp.config.json', 'dist/staticwebapp.config.json');
              console.log('staticwebapp.config.json copied to dist/');
            } catch (error) {
              console.error('Error copying staticwebapp.config.json:', error);
            }
          },
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // Fix: Replace `__dirname` which is not available in ES modules with a standards-compliant equivalent using `import.meta.url`.
          '@': path.dirname(fileURLToPath(import.meta.url)),
        }
      }
    };
});