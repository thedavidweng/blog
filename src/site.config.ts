import { description, role, about, nav, tags } from './config/i18n';
import { social } from './config/social';
import { defaultLocale, locales } from './config/locale';
import type { Locale } from './config/locale';

export { defaultLocale, locales };
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

export function getLocaleBase(locale: Locale) {
  return locale === defaultLocale ? '' : `/${locale}`;
}

export function localizedPath(locale: Locale, path = '/') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return cleanPath;
  return `${getLocaleBase(locale)}${cleanPath === '/' ? '/' : cleanPath}`;
}

export function absoluteUrl(path = '/') {
  return new URL(path, getBaseUrl()).toString();
}
