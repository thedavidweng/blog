import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, siteConfig, type Locale, locales } from '../site.config';

export type PostEntry = CollectionEntry<'posts'>;

export function parsePostId(id: string) {
  const [locale, ...pathParts] = id.replace(/\.md$/, '').split('/');
  if (!isLocale(locale) || pathParts.length !== 1 || !pathParts[0]) {
    throw new Error(`Invalid post id "${id}". Expected <locale>/<filename>.md`);
  }
  return { locale, filenameSlug: pathParts[0] };
}

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getPostLocale(post: PostEntry): Locale {
  if (post.data.locale && isLocale(post.data.locale)) {
    return post.data.locale;
  }
  return parsePostId(post.id).locale;
}

export async function getPublishedPosts(locale?: Locale) {
  const entries = await getCollection('posts', ({ data }) => !data.draft);
  const filtered = locale
    ? entries.filter((entry) => getPostLocale(entry) === locale)
    : entries;
  return filtered.sort((a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf());
}

export function getPostSlug(post: PostEntry): string {
  return post.data.slug ?? parsePostId(post.id).filenameSlug;
}

export async function getPostPairs() {
  const posts = await getPublishedPosts();
  const bySlug = new Map<string, Partial<Record<Locale, PostEntry>>>();

  for (const post of posts) {
    const locale = getPostLocale(post);
    const slug = getPostSlug(post);
    const pair = bySlug.get(slug) ?? {};
    pair[locale] = post;
    bySlug.set(slug, pair);
  }

  return [...bySlug.entries()].map(([slug, postsByLocale]) => ({ slug, posts: postsByLocale }));
}

export async function assertTranslatedPostPairs() {
  const pairs = await getPostPairs();
  const complete = pairs.filter(({ posts }) =>
    locales.every((locale) => posts[locale])
  );

  const missing = pairs.filter(({ posts }) =>
    !locales.every((locale) => posts[locale])
  );
  if (missing.length > 0) {
    const missingList = missing.map(
      ({ slug, posts }) => `${slug}: missing ${locales.filter((l) => !posts[l]).join(', ')}`
    );
    console.warn(`Skipping incomplete translations: ${missingList.join(', ')}`);
  }

  return complete as Array<{ slug: string; posts: Record<Locale, PostEntry> }>;
}

export function postUrl(locale: Locale, slug: string) {
  return locale === defaultLocale ? `/posts/${slug}/` : `/${locale}/posts/${slug}/`;
}

export function tagUrl(locale: Locale, tag: string) {
  const encoded = encodeURIComponent(tag);
  return locale === defaultLocale ? `/tags/${encoded}/` : `/${locale}/tags/${encoded}/`;
}

export function tagLabel(locale: Locale, tag: string) {
  const labels = siteConfig.tags[tag as keyof typeof siteConfig.tags];
  if (!labels) {
    throw new Error(`Unknown tag "${tag}". Add it to siteConfig.tags.`);
  }
  return labels[locale];
}

export function ogImagePath(locale: Locale, slug: string) {
  return locale === defaultLocale ? `/og/${slug}.png` : `/${locale}/og/${slug}.png`;
}

export async function getTags(locale: Locale) {
  const posts = await getPublishedPosts(locale);
  return [...new Set(posts.flatMap((post) => post.data.tags))].sort((a, b) => a.localeCompare(b));
}
