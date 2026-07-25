import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ogImageOptions } from '../src/lib/og';
import { assert } from './harness';

const root = fileURLToPath(new URL('..', import.meta.url));

async function readSource(path: string) {
  return readFile(join(root, path), 'utf8');
}

const samplePage = { title: 'Test', description: 'Test description' };

const enOg = ogImageOptions(samplePage, 'en');
const zhOg = ogImageOptions(samplePage, 'zh');

assert(
  enOg.fonts.some((f) => f.includes('latin-700-normal.ttf')),
  'English OG must load a bold Latin font for titles.',
);

assert(enOg.font.title.size === 74, 'English OG title size must be 74.');

assert(
  zhOg.fonts.some((f) => f.includes('noto-sans-sc')),
  'Chinese OG must load Noto Sans SC font files.',
);

assert(
  zhOg.font.title.families.includes('Noto Sans SC Thin'),
  'Chinese OG must use the CanvasKit family name for Noto Sans SC.',
);

assert(zhOg.font.title.size === 72, 'Chinese OG title size must be 72.');

assert(enOg.font.title.families.includes('Noto Sans'), 'English OG must use Noto Sans family.');

assert(
  JSON.stringify(enOg.bgGradient) === JSON.stringify([[16, 16, 17]]),
  'OG background gradient must be shared across locales.',
);

assert(enOg.border.width === zhOg.border.width, 'OG border width must be shared across locales.');

const contentConfig = await readSource('src/content.config.ts');
assert(
  contentConfig.includes('generateId'),
  'Content loader must preserve locale in entry ids instead of using duplicate frontmatter slugs.',
);

const packageJson = JSON.parse(await readSource('package.json')) as {
  dependencies?: Record<string, string>;
};
assert(
  packageJson.dependencies?.['canvaskit-wasm'],
  'astro-og-canvas requires canvaskit-wasm as a direct dependency when installing with pnpm.',
);

console.log('Source contract ok: OG config and content invariants verified.');
