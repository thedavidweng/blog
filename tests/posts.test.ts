import {
  collectTags,
  getPostLocale,
  getPostSlug,
  pairPostsBySlug,
  parsePostId,
  publishedPosts,
  translatedPairs,
  type PostEntry,
} from '../src/lib/posts';
import { assert, summarize, test } from './harness';

type FixtureData = {
  slug?: string;
  locale?: 'en' | 'zh';
  draft?: boolean;
  publishedDate?: Date;
  tags?: string[];
};

let day = 1;
function post(id: string, data: FixtureData = {}): PostEntry {
  return {
    id,
    data: {
      title: id,
      description: `About ${id}`,
      publishedDate: data.publishedDate ?? new Date(2026, 0, day++),
      tags: data.tags ?? ['Tools'],
      draft: data.draft ?? false,
      slug: data.slug,
      locale: data.locale,
    },
  } as unknown as PostEntry;
}

await test('parsePostId: splits locale and filename slug', () => {
  const parsed = parsePostId('en/hello-world.md');
  assert(parsed.locale === 'en', 'locale should be en');
  assert(parsed.filenameSlug === 'hello-world', 'slug should drop the extension');
  assert(parsePostId('zh/hello-world.mdx').locale === 'zh', 'mdx should parse too');
});

await test('parsePostId: rejects ids without a valid locale prefix', () => {
  for (const bad of ['fr/post.md', 'post.md', 'en/nested/post.md', 'en/.md']) {
    let threw = false;
    try {
      parsePostId(bad);
    } catch {
      threw = true;
    }
    assert(threw, `"${bad}" should be rejected`);
  }
});

await test('getPostLocale / getPostSlug: frontmatter wins over the id', () => {
  const fromId = post('en/from-id.md');
  assert(getPostLocale(fromId) === 'en', 'locale should derive from id');
  assert(getPostSlug(fromId) === 'from-id', 'slug should derive from id');

  const overridden = post('en/file-name.md', { locale: 'zh', slug: 'custom-slug' });
  assert(getPostLocale(overridden) === 'zh', 'frontmatter locale should win');
  assert(getPostSlug(overridden) === 'custom-slug', 'frontmatter slug should win');
});

await test('publishedPosts: drops drafts, filters by locale, sorts newest first', () => {
  const older = post('en/older.md', { publishedDate: new Date('2026-01-01') });
  const newer = post('en/newer.md', { publishedDate: new Date('2026-06-01') });
  const zh = post('zh/newer.md', { publishedDate: new Date('2026-06-01') });
  const draft = post('en/draft.md', { draft: true, publishedDate: new Date('2026-07-01') });

  const en = publishedPosts([older, draft, zh, newer], 'en');
  assert(en.length === 2, `expected 2 published en posts, got ${en.length}`);
  assert(en[0] === newer && en[1] === older, 'should sort newest first');

  const all = publishedPosts([older, draft, zh, newer]);
  assert(all.length === 3, 'without locale, all published posts remain');
});

await test('pairPostsBySlug: groups translations by slug', () => {
  const en = post('en/hello.md');
  const zh = post('zh/hello.md');
  const lonely = post('en/lonely.md');

  const pairs = pairPostsBySlug([en, zh, lonely]);
  assert(pairs.length === 2, `expected 2 pairs, got ${pairs.length}`);
  const hello = pairs.find((p) => p.slug === 'hello');
  assert(hello?.posts.en === en && hello?.posts.zh === zh, 'both locales should pair up');
});

await test('translatedPairs: keeps only complete pairs and warns about the rest', () => {
  const warnings: string[] = [];
  const originalWarn = console.warn;
  console.warn = (msg: string) => warnings.push(msg);
  try {
    const pairs = pairPostsBySlug([post('en/hello.md'), post('zh/hello.md'), post('en/lonely.md')]);
    const complete = translatedPairs(pairs);
    assert(complete.length === 1, `expected 1 complete pair, got ${complete.length}`);
    assert(complete[0].slug === 'hello', 'the complete pair should survive');
    assert(warnings.length === 1, 'incomplete pairs should be warned about');
    assert(
      warnings[0].includes('lonely: missing zh'),
      `warning should name the gap: ${warnings[0]}`,
    );
  } finally {
    console.warn = originalWarn;
  }
});

await test('translatedPairs: complete input warns nothing', () => {
  const warnings: string[] = [];
  const originalWarn = console.warn;
  console.warn = (msg: string) => warnings.push(msg);
  try {
    const pairs = pairPostsBySlug([post('en/hello.md'), post('zh/hello.md')]);
    assert(translatedPairs(pairs).length === 1, 'pair should survive');
    assert(warnings.length === 0, 'no warning for complete pairs');
  } finally {
    console.warn = originalWarn;
  }
});

await test('collectTags: unique sorted tags across posts', () => {
  const tags = collectTags([
    post('en/a.md', { tags: ['Tools', 'Finance'] }),
    post('en/b.md', { tags: ['Animation', 'Tools'] }),
  ]);
  assert(JSON.stringify(tags) === JSON.stringify(['Animation', 'Finance', 'Tools']), `got ${tags}`);
});

summarize();
