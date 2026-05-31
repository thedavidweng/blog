import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getRssItems } from '../lib/locale-routing';
import { absoluteUrl, siteConfig } from '../site.config';

export const GET: APIRoute = async () => {
  const locale = 'en';

  return rss({
    title: siteConfig.name,
    description: siteConfig.description[locale],
    site: absoluteUrl('/'),
    items: await getRssItems(locale)
  });
};
