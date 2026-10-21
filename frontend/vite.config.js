import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs + a single inlined index.html so `dist/index.html`
  // can be opened directly from disk (file://) with no server.
  base: './',
  plugins: [react(), viteSingleFile()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
