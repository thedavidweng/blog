import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function readSource(path: string) {
  return readFile(join(root, path), 'utf8');
}

const zhOgRoute = await readSource('src/pages/zh/og/[...slug].ts');
const enOgRoute = await readSource('src/pages/og/[...slug].ts');
const postLayout = await readSource('src/layouts/PostLayout.astro');
const globalCss = await readSource('src/styles/global.css');
const contentConfig = await readSource('src/content.config.ts');
const contentLib = await readSource('src/lib/content.ts');
const llmsRoute = await readSource('src/pages/llms.txt.ts');
const enRssRoute = await readSource('src/pages/rss.xml.ts');
const zhRssRoute = await readSource('src/pages/zh/rss.xml.ts');
const packageJson = JSON.parse(await readSource('package.json')) as {
  dependencies?: Record<string, string>;
};

assert(zhOgRoute.includes('noto-sans-sc'), 'Chinese OG route must load Noto Sans SC font files.');
assert(zhOgRoute.includes('Noto Sans SC Thin'), 'Chinese OG route must render with the CanvasKit family name for Noto Sans SC.');
assert(zhOgRoute.includes('size: 72'), 'Chinese OG title should be large enough for social cards.');
assert(enOgRoute.includes('latin-700-normal.ttf'), 'English OG route must load a bold Latin font for titles.');
assert(postLayout.includes('ogImagePath'), 'Post layout must use the generated static OG image path.');
assert(enOgRoute.includes('size: 74'), 'English OG title should be large enough for social cards.');
assert(!postLayout.includes('class="og-preview"'), 'Post layout must not render the OG image inside article content.');
assert(!globalCss.includes('.og-preview'), 'Unused OG preview styles should not remain in global CSS.');
assert(contentConfig.includes('generateId'), 'Content loader must preserve locale in entry ids instead of using duplicate frontmatter slugs.');
assert(contentLib.includes('getPostSlug'), 'Content helpers must expose one canonical post slug accessor.');
assert(!postLayout.includes('post.slug'), 'Post layout must not use the removed Astro post.slug field.');
assert(!llmsRoute.includes('post.slug'), 'LLMs route must not use the removed Astro post.slug field.');
assert(!enRssRoute.includes('post.slug'), 'English RSS route must not use the removed Astro post.slug field.');
assert(!zhRssRoute.includes('post.slug'), 'Chinese RSS route must not use the removed Astro post.slug field.');
assert(
  packageJson.dependencies?.['canvaskit-wasm'],
  'astro-og-canvas requires canvaskit-wasm as a direct dependency when installing with pnpm.'
);

console.log('Source contract ok: OG fonts and preview hooks are configured.');
