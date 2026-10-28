import { cloudflare } from '@cloudflare/vite-plugin';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// turndown's browser field swaps in a DOM build and stubs @mixmark-io/domino.
// The Worker has no document; HTML parsing has to use the Node build and domino.
const root = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  publicDir: fileURLToPath(new URL('../dist', import.meta.url)),
  resolve: {
    alias: {
      turndown: fileURLToPath(
        new URL('../node_modules/turndown/lib/turndown.cjs.js', import.meta.url),
      ),
      '@mixmark-io/domino': fileURLToPath(import.meta.resolve('@mixmark-io/domino')),
    },
  },
  server: { fs: { allow: [root] } },
  plugins: [cloudflare()],
});
