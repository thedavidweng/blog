import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getRssItems } from '../../lib/locale-routing';
import { absoluteUrl, siteConfig } from '../../site.config';

export const GET: APIRoute = async () => {
  const locale = 'zh';

  return rss({
    title: `${siteConfig.name} 中文`,
    description: siteConfig.description[locale],
    site: absoluteUrl('/zh/'),
    items: await getRssItems(locale),
  });
};
