import type { CollectionEntry } from 'astro:content';
import { assertTranslatedPostPairs, getTags } from './content';
import { getPostSlug } from './posts';
import { alternateLocale, postUrl, type Locale } from './locale';
import { SITE_OG_SLUG } from './og';
import { siteConfig } from '../site.config';

export async function getPostStaticPaths(locale: Locale) {
  const pairs = await assertTranslatedPostPairs();
  const sorted = pairs.toSorted(
    (a, b) =>
      b.posts[locale].data.publishedDate.valueOf() - a.posts[locale].data.publishedDate.valueOf(),
  );

  const allPosts = new Map<string, CollectionEntry<'posts'>>();
  for (const { posts } of sorted) {
    allPosts.set(getPostSlug(posts[locale]), posts[locale]);
  }

  return sorted.map(({ slug, posts }, index) => {
    const relatedSlugs = posts[locale].data.related ?? [];
    const relatedPosts = relatedSlugs
      .map((s) => allPosts.get(s))
      .filter((p): p is CollectionEntry<'posts'> => p !== undefined);

    return {
      params: { slug },
      props: {
        post: posts[locale],
        alternatePath: postUrl(alternateLocale(locale), slug),
        prev: index < sorted.length - 1 ? sorted[index + 1].posts[locale] : undefined,
        next: index > 0 ? sorted[index - 1].posts[locale] : undefined,
        relatedPosts,
      },
    };
  });
}

export async function getTagStaticPaths(locale: Locale) {
  const tags = await getTags(locale);
  return tags.map((tag) => ({ params: { tag }, props: { tag } }));
}

export async function getOgPages(locale: Locale) {
  const pairs = await assertTranslatedPostPairs();
  if (pairs.some(({ slug }) => slug === SITE_OG_SLUG)) {
    throw new Error(`Post slug "${SITE_OG_SLUG}" is reserved for the site-wide OG image.`);
  }
  const pages: Record<string, { title: string; description: string }> = {
    [SITE_OG_SLUG]: { title: siteConfig.name, description: siteConfig.description[locale] },
  };
  for (const { slug, posts } of pairs) {
    pages[slug] = {
      title: posts[locale].data.title,
      description: posts[locale].data.description,
    };
  }
  return pages;
}
