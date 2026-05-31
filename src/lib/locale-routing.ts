import type { CollectionEntry } from 'astro:content';
import { assertTranslatedPostPairs, getPostSlug, getPublishedPosts, getTags, ogImagePath, postUrl, tagLabel } from './content';
import { absoluteUrl, siteConfig, type Locale, defaultLocale } from '../site.config';

/** Shared getStaticPaths for post detail pages. */
export async function getPostStaticPaths(locale: Locale) {
  const pairs = await assertTranslatedPostPairs();
  const sorted = pairs.sort((a, b) =>
    b.posts[locale].data.publishedDate.valueOf() - a.posts[locale].data.publishedDate.valueOf()
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
        alternatePath: postUrl(locale === 'en' ? 'zh' : 'en', slug),
        prev: index < sorted.length - 1 ? sorted[index + 1].posts[locale] : undefined,
        next: index > 0 ? sorted[index - 1].posts[locale] : undefined,
        relatedPosts
      }
    };
  });
}

/** Shared getStaticPaths for tag detail pages. */
export async function getTagStaticPaths(locale: Locale) {
  const tags = await getTags(locale);
  return tags.map((tag) => ({ params: { tag }, props: { tag } }));
}

/** Build the `pages` object for OG image routes (shared across locales). */
export async function getOgPages(locale: Locale) {
  const pairs = await assertTranslatedPostPairs();
  return Object.fromEntries(
    pairs.map(({ slug, posts }) => [
      slug,
      {
        title: posts[locale].data.title,
        description: posts[locale].data.description
      }
    ])
  );
}

/** Build RSS feed items array (shared across locales). */
export async function getRssItems(locale: Locale) {
  const posts = await getPublishedPosts(locale);
  return posts.map((post) => {
    const slug = getPostSlug(post);
    return {
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedDate,
      link: postUrl(locale, slug),
      categories: post.data.tags.map((tag) => tagLabel(locale, tag)),
      customData: `<enclosure url="${absoluteUrl(ogImagePath(locale, slug))}" type="image/png" />`
    };
  });
}

/** Build JSON-LD structured data for the home page. */
export function getHomeJsonLd(locale: Locale) {
  const siteUrl = absoluteUrl('/');
  const pageUrl = locale === defaultLocale ? siteUrl : absoluteUrl(`/${locale}/`);
  const socialUrls = siteConfig.social
    .filter(s => ['GitHub', 'LinkedIn', 'X'].includes(s.label))
    .map(s => s.href);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        name: siteConfig.name,
        description: siteConfig.description[locale],
        url: pageUrl,
        author: {
          '@type': 'Person',
          name: siteConfig.author,
          jobTitle: 'Developer and Designer',
          knowsAbout: ['Open-source tools', 'Desktop application development', 'AI-integrated creative work']
        },
        inLanguage: locale === 'en' ? 'en' : 'zh-CN'
      },
      {
        '@type': 'Organization',
        name: siteConfig.name,
        url: siteUrl,
        logo: absoluteUrl('/android-chrome-512x512.png'),
        sameAs: socialUrls
      },
      {
        '@type': 'Person',
        name: siteConfig.author,
        url: siteUrl,
        sameAs: socialUrls,
        jobTitle: 'Developer and Designer',
        knowsAbout: ['Open-source tools', 'Desktop application development', 'AI-integrated creative work']
      },
      {
        '@type': 'WebSite',
        name: siteConfig.name,
        url: siteUrl
      }
    ]
  };
}
