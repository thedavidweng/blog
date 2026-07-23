import { description, role, about, nav, tags } from './config/i18n';
import { social } from './config/social';
import { defaultLocale, locales, localizedPath, type Locale } from './lib/locale';

export { defaultLocale, locales, localizedPath };
export type { Locale };

export const siteConfig = {
  name: 'David Blog',
  author: 'David',
  handle: '@thedavidweng',
  description,
  role,
  about,
  nav,
  tags,
  social,
} as const;

export function getBaseUrl() {
  return process.env.PUBLIC_SITE_URL || process.env.CF_PAGES_URL || 'http://localhost:4321';
}

export function absoluteUrl(path = '/') {
  return new URL(path, getBaseUrl()).toString();
}
