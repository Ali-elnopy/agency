import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Public demo build.
//
// Unlike `dist-dev` (local only), this bundle is meant to be published to a
// static host so reviewers can open the product with no backend, no account
// and no local setup. It forces `import.meta.env.DEV` to true so the demo
// login bypass and the localStorage fixtures stay in the bundle, and inlines
// every asset into a single `index.html` so it can be served from any static
// host (GitHub Pages, Netlify, S3, ...) under any base path.
//
// It must never be used for a real deployment: the demo session is not
// authenticated against the API.
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
  // Bake the demo login bypass in so `npm run build:demo` works on any
  // machine without extra environment variables.
  define: {
    'import.meta.env.VITE_DEV_BYPASS_LOGIN': JSON.stringify('true'),
    'import.meta.env.VITE_USE_MOCK_API': JSON.stringify('true'),
  },
  plugins: [forceDevelopmentEnv(), react(), viteSingleFile()],
  build: {
    outDir: 'dist-demo',
    emptyOutDir: true,
    // `esnext` skips the esbuild down-level step, which intermittently fails
    // to clean its temp file on this Windows setup.
    target: 'esnext',
    minify: false,
  },
});
