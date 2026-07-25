import type { CollectionEntry } from 'astro:content';
import { isLocale, locales, type Locale } from './locale';

export type PostEntry = CollectionEntry<'posts'>;

export type PostPair = { slug: string; posts: Partial<Record<Locale, PostEntry>> };
export type TranslatedPostPair = { slug: string; posts: Record<Locale, PostEntry> };

export function parsePostId(id: string) {
  const [locale, ...pathParts] = id.replace(/\.(md|mdx)$/, '').split('/');
  if (!isLocale(locale) || pathParts.length !== 1 || !pathParts[0]) {
    throw new Error(`Invalid post id "${id}". Expected <locale>/<filename>.md or .mdx`);
  }
  return { locale, filenameSlug: pathParts[0] };
}

export function getPostLocale(post: PostEntry): Locale {
  return post.data.locale ?? parsePostId(post.id).locale;
}

export function getPostSlug(post: PostEntry): string {
  return post.data.slug ?? parsePostId(post.id).filenameSlug;
}

export function publishedPosts(entries: PostEntry[], locale?: Locale) {
  const published = entries.filter((entry) => !entry.data.draft);
  const filtered = locale
    ? published.filter((entry) => getPostLocale(entry) === locale)
    : published;
  return filtered.toSorted(
    (a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf(),
  );
}

export function pairPostsBySlug(posts: PostEntry[]): PostPair[] {
  const bySlug = new Map<string, Partial<Record<Locale, PostEntry>>>();

  for (const post of posts) {
    const slug = getPostSlug(post);
    const pair = bySlug.get(slug) ?? {};
    pair[getPostLocale(post)] = post;
    bySlug.set(slug, pair);
  }

  return [...bySlug.entries()].map(([slug, postsByLocale]) => ({ slug, posts: postsByLocale }));
}

const isComplete = (posts: PostPair['posts']) => locales.every((locale) => posts[locale]);

export function translatedPairs(pairs: PostPair[]): TranslatedPostPair[] {
  const missing = pairs.filter(({ posts }) => !isComplete(posts));
  if (missing.length > 0) {
    console.warn(
      `Skipping incomplete translations: ${missing
        .map(({ slug, posts }) => `${slug}: missing ${locales.filter((l) => !posts[l]).join(', ')}`)
        .join(', ')}`,
    );
  }

  return pairs.filter(({ posts }) => isComplete(posts)) as TranslatedPostPair[];
}

export function collectTags(posts: PostEntry[]) {
  return [...new Set(posts.flatMap((post) => post.data.tags))].toSorted((a, b) =>
    a.localeCompare(b),
  );
}
