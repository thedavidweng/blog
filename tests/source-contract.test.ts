import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ogImageOptions } from '../src/lib/og';
import { ogImagePath, postUrl, tagUrl } from '../src/lib/locale';

const root = fileURLToPath(new URL('..', import.meta.url));

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function readSource(path: string) {
  return readFile(join(root, path), 'utf8');
}

// ── OG image configuration (behavioural: call ogImageOptions, check output) ──

const samplePage = { title: 'Test', description: 'Test description' };

const enOg = ogImageOptions(samplePage, 'en');
const zhOg = ogImageOptions(samplePage, 'zh');

assert(
  enOg.fonts.some((f) => f.includes('latin-700-normal.ttf')),
  'English OG must load a bold Latin font for titles.',
);

assert(
  enOg.font.title.size === 74,
  'English OG title size must be 74.',
);

assert(
  zhOg.fonts.some((f) => f.includes('noto-sans-sc')),
  'Chinese OG must load Noto Sans SC font files.',
);

assert(
  zhOg.font.title.families.includes('Noto Sans SC Thin'),
  'Chinese OG must use the CanvasKit family name for Noto Sans SC.',
);

assert(
  zhOg.font.title.size === 72,
  'Chinese OG title size must be 72.',
);

assert(
  enOg.font.title.families.includes('Noto Sans'),
  'English OG must use Noto Sans family.',
);

assert(
  JSON.stringify(enOg.bgGradient) === JSON.stringify([[16, 16, 17]]),
  'OG background gradient must be shared across locales.',
);

assert(
  enOg.border.width === zhOg.border.width,
  'OG border width must be shared across locales.',
);

// ── Locale URL generation (behavioural: call functions, check output) ──

assert(postUrl('en', 'hello') === '/posts/hello/', 'English post URL must not have locale prefix.');
assert(postUrl('zh', 'hello') === '/zh/posts/hello/', 'Chinese post URL must have /zh/ prefix.');
assert(tagUrl('en', 'Finance') === '/tags/Finance/', 'English tag URL must not have locale prefix.');
assert(tagUrl('zh', 'Finance') === '/zh/tags/Finance/', 'Chinese tag URL must have /zh/ prefix.');
assert(ogImagePath('en', 'hello') === '/og/hello.png', 'English OG image path must not have locale prefix.');
assert(ogImagePath('zh', 'hello') === '/zh/og/hello.png', 'Chinese OG image path must have /zh/ prefix.');

// ── Content config structural invariant (custom ID generator preserves locale) ──

const contentConfig = await readSource('src/content.config.ts');
assert(
  contentConfig.includes('generateId'),
  'Content loader must preserve locale in entry ids instead of using duplicate frontmatter slugs.',
);

// ── canvaskit-wasm is a direct dependency (required by astro-og-canvas with pnpm) ──

const packageJson = JSON.parse(await readSource('package.json')) as {
  dependencies?: Record<string, string>;
};
assert(
  packageJson.dependencies?.['canvaskit-wasm'],
  'astro-og-canvas requires canvaskit-wasm as a direct dependency when installing with pnpm.',
);

console.log('Source contract ok: OG config, locale URLs, and content invariants verified.');
