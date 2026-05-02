import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPostSlug, getPublishedPosts, ogImagePath, postUrl, tagLabel } from '../../lib/content';
import { absoluteUrl, siteConfig } from '../../site.config';

export const GET: APIRoute = async () => {
  const locale = 'zh';
  const posts = await getPublishedPosts(locale);

  return rss({
    title: `${siteConfig.name} 中文`,
    description: siteConfig.description[locale],
    site: absoluteUrl('/zh/'),
    items: posts.map((post) => {
      const slug = getPostSlug(post);
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.publishedDate,
        link: postUrl(locale, slug),
        categories: post.data.tags.map((tag) => tagLabel(locale, tag)),
        customData: `<enclosure url="${absoluteUrl(ogImagePath(locale, slug))}" type="image/png" />`
      };
    })
  });
};
