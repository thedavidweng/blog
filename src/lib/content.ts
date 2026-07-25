import { getCollection, type CollectionEntry } from 'astro:content';
import { siteConfig } from '../site.config';
import { isLocale, postUrl, locales, type Locale } from './locale';

export type PostEntry = CollectionEntry<'posts'>;

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

export function getPostInfo(post: PostEntry) {
  return { url: postUrl(getPostLocale(post), getPostSlug(post)), title: post.data.title };
}

export function publishedLabel(locale: Locale, date: Date) {
  const formatted = date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  return locale === 'zh' ? `发布于 ${formatted}` : `Published on ${formatted}`;
}

async function getPostPairs() {
  const posts = await getPublishedPosts();
  const bySlug = new Map<string, Partial<Record<Locale, PostEntry>>>();

  for (const post of posts) {
    const slug = getPostSlug(post);
    const pair = bySlug.get(slug) ?? {};
    pair[getPostLocale(post)] = post;
    bySlug.set(slug, pair);
  }

  return [...bySlug.entries()].map(([slug, postsByLocale]) => ({ slug, posts: postsByLocale }));
}

const isComplete = (posts: Partial<Record<Locale, PostEntry>>) =>
  locales.every((locale) => posts[locale]);

export async function assertTranslatedPostPairs() {
  const pairs = await getPostPairs();
  const missing = pairs.filter(({ posts }) => !isComplete(posts));
  if (missing.length > 0) {
    console.warn(
      `Skipping incomplete translations: ${missing
        .map(({ slug, posts }) => `${slug}: missing ${locales.filter((l) => !posts[l]).join(', ')}`)
        .join(', ')}`,
    );
  }

  return pairs.filter(({ posts }) => isComplete(posts)) as Array<{
    slug: string;
    posts: Record<Locale, PostEntry>;
  }>;
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
