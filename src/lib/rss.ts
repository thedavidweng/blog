import rss from '@astrojs/rss';
import { getPublishedPosts } from './content';
import { getPostSlug } from './posts';
import { tagLabel } from '../config/i18n';
import { absoluteUrl, siteConfig } from '../site.config';
import { defaultLocale, localizedPath, ogImagePath, postUrl, type Locale } from './locale';

async function feedItems(locale: Locale) {
  const posts = await getPublishedPosts(locale);
  return posts.map((post) => {
    const slug = getPostSlug(post);
    return {
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedDate,
      link: postUrl(locale, slug),
      categories: post.data.tags.map((tag) => tagLabel(locale, tag)),
      customData: `<enclosure url="${absoluteUrl(ogImagePath(locale, slug))}" type="image/png" />`,
    };
  });
}

export async function rssResponse(locale: Locale) {
  return rss({
    title: locale === defaultLocale ? siteConfig.name : `${siteConfig.name} 中文`,
    description: siteConfig.description[locale],
    site: absoluteUrl(localizedPath(locale)),
    items: await feedItems(locale),
  });
}
