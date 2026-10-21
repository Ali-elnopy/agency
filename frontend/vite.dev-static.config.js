import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Local-only static build. It forces `import.meta.env.DEV` to true so the
// development login bypass and the local mock data stay in the bundle, which
// makes `dist-dev/index.html` openable directly from disk without a server.
//
// NEVER deploy dist-dev. The production build (`npm run build`) is untouched
// and still compiles the bypass out of `dist/index.html`.
function forceDevelopmentEnv() {
  return {
    name: 'force-development-env',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('node_modules')) return null;
      if (!code.includes('import.meta.env.DEV') && !code.includes('import.meta.env.PROD')) {
        return null;
      }

      return {
        code: code
          .replaceAll('import.meta.env.DEV', 'true')
          .replaceAll('import.meta.env.PROD', 'false'),
        map: null,
      };
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [forceDevelopmentEnv(), react(), viteSingleFile()],
  build: {
    outDir: 'dist-dev',
    emptyOutDir: true,
  },
});
