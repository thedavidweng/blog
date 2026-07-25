/** Locale-prefix pattern and all locale-aware URL generation. See ADR-0002. */

export const defaultLocale = 'en' as const;
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleBase(locale: Locale) {
  return locale === defaultLocale ? '' : `/${locale}`;
}

/** Full localized path, e.g. `localizedPath('zh', '/tags/')` → `/zh/tags/`. */
export function localizedPath(locale: Locale, path = '/') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${getLocaleBase(locale)}${cleanPath}`;
}

export function postUrl(locale: Locale, slug: string) {
  return localizedPath(locale, `/posts/${slug}/`);
}

export function tagUrl(locale: Locale, tag: string) {
  return localizedPath(locale, `/tags/${encodeURIComponent(tag)}/`);
}

export function ogImagePath(locale: Locale, slug: string) {
  return localizedPath(locale, `/og/${slug}.png`);
}
