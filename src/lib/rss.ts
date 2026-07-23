import rss from '@astrojs/rss';
import { getRssItems } from './locale-routing';
import { absoluteUrl, siteConfig } from '../site.config';
import { defaultLocale, type Locale } from './locale';

/** Build the RSS response for a locale, handling title and site URL differences. */
export async function rssResponse(locale: Locale) {
  const isDefault = locale === defaultLocale;
  return rss({
    title: isDefault ? siteConfig.name : `${siteConfig.name} 中文`,
    description: siteConfig.description[locale],
    site: absoluteUrl(isDefault ? '/' : `/${locale}/`),
    items: await getRssItems(locale),
  });
}
