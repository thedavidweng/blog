import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { htmlToMarkdown } from '../src/lib/markdown-response';
import { siteConfig } from '../src/site.config';

const root = fileURLToPath(new URL('..', import.meta.url));
const requiredFiles = [
  'dist/index.html',
  'dist/zh/index.html',
  'dist/posts/hello-astro/index.html',
  'dist/zh/posts/hello-astro/index.html',
  'dist/og/site.png',
  'dist/zh/og/site.png',
  'dist/og/hello-astro.png',
  'dist/zh/og/hello-astro.png',
  'dist/rss.xml',
  'dist/zh/rss.xml',
  'dist/sitemap-index.xml',
  'dist/robots.txt',
  'dist/llms.txt',
];

for (const file of requiredFiles) {
  const info = await stat(join(root, file));
  if (!info.isFile() || info.size === 0) {
    throw new Error(`${file} must exist and be non-empty.`);
  }
}

const postHtml = await readFile(join(root, 'dist/posts/hello-astro/index.html'), 'utf8');
const markdown = htmlToMarkdown(postHtml);
if (!markdown.includes('# ')) {
  throw new Error('Markdown extraction must keep the article heading.');
}
for (const chrome of [siteConfig.role.en, 'Skip to content']) {
  if (markdown.includes(chrome)) {
    throw new Error(
      `Markdown extraction leaked page chrome ("${chrome}") — ` +
        'is <main> still tagged with MAIN_CONTENT_ID?',
    );
  }
}

console.log(
  `Dist contract ok: ${requiredFiles.length} required static files, markdown extraction clean.`,
);
