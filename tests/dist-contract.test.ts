import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const requiredFiles = [
  'dist/index.html',
  'dist/zh/index.html',
  'dist/posts/hello-astro/index.html',
  'dist/zh/posts/hello-astro/index.html',
  'dist/og/hello-astro.png',
  'dist/zh/og/hello-astro.png',
  'dist/rss.xml',
  'dist/zh/rss.xml',
  'dist/sitemap-index.xml',
  'dist/robots.txt',
  'dist/llms.txt'
];

for (const file of requiredFiles) {
  const info = await stat(join(root, file));
  if (!info.isFile() || info.size === 0) {
    throw new Error(`${file} must exist and be non-empty.`);
  }
}

console.log(`Dist contract ok: ${requiredFiles.length} required static files.`);
