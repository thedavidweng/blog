import { defineWranglerConfig } from 'wrangler/experimental-config';
import { fileURLToPath } from 'node:url';

export default defineWranglerConfig({
  assetsDirectory: '../dist',
  alias: {
    turndown: '../node_modules/turndown/lib/turndown.cjs.js',
    '@mixmark-io/domino': fileURLToPath(import.meta.resolve('@mixmark-io/domino')),
  },
});
