import { getCollection, type CollectionEntry } from 'astro:content';
import { siteConfig, type Locale, locales } from '../site.config';
import { isLocale, postUrl } from './locale';

export type PostEntry = CollectionEntry<'posts'>;

export function parsePostId(id: string) {
  const [locale, ...pathParts] = id.replace(/\.(md|mdx)$/, '').split('/');
  if (!isLocale(locale) || pathParts.length !== 1 || !pathParts[0]) {
    throw new Error(`Invalid post id "${id}". Expected <locale>/<filename>.md or .mdx`);
  }
  return { locale, filenameSlug: pathParts[0] };
}

export { isLocale } from './locale';
export { postUrl, tagUrl, ogImagePath } from './locale';

export function getPostLocale(post: PostEntry): Locale {
  if (post.data.locale && isLocale(post.data.locale)) {
    return post.data.locale;
  }
  return parsePostId(post.id).locale;
}

export async function getPublishedPosts(locale?: Locale) {
  const entries = await getCollection('posts', ({ data }) => !data.draft);
  const filtered = locale ? entries.filter((entry) => getPostLocale(entry) === locale) : entries;
  return filtered.toSorted(
    (a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf(),
  );
}

export function getPostSlug(post: PostEntry): string {
  return post.data.slug ?? parsePostId(post.id).filenameSlug;
}

/** Post URL + title for navigation/related-post links. */
export function getPostInfo(post: PostEntry) {
  const slug = getPostSlug(post);
  const postLocale = getPostLocale(post);
  return { url: postUrl(postLocale, slug), title: post.data.title };
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
  const missing = pairs.filter(({ posts }) => !locales.every((locale) => posts[locale]));
  if (missing.length > 0) {
    const missingList = missing.map(
      ({ slug, posts }) => `${slug}: missing ${locales.filter((l) => !posts[l]).join(', ')}`,
    );
    console.warn(`Skipping incomplete translations: ${missingList.join(', ')}`);
  }

  return pairs.filter(({ posts }) =>
    locales.every((locale) => posts[locale]),
  ) as Array<{ slug: string; posts: Record<Locale, PostEntry> }>;
}

export function tagLabel(locale: Locale, tag: string) {
  const labels = siteConfig.tags[tag as keyof typeof siteConfig.tags];
  if (!labels) {
    throw new Error(`Unknown tag "${tag}". Add it to siteConfig.tags.`);
  }
  return labels[locale];
}

export async function getTags(locale: Locale) {
  const posts = await getPublishedPosts(locale);
  return [...new Set(posts.flatMap((post) => post.data.tags))].toSorted((a, b) =>
    a.localeCompare(b),
  );
}
