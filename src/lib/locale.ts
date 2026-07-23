/**
 * Locale module — owns the locale-prefix pattern and all locale-aware URL generation.
 * See ADR-0002 for the decision record.
 */

export const defaultLocale = 'en' as const;
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

/** URL prefix for a locale: empty for the default locale, `/${locale}` otherwise. */
export function getLocaleBase(locale: Locale) {
  return locale === defaultLocale ? '' : `/${locale}`;
}

/** Full localized path for a locale, e.g. `localizedPath('zh', '/tags/')` → `/zh/tags/`. */
export function localizedPath(locale: Locale, path = '/') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return cleanPath;
  return `${getLocaleBase(locale)}${cleanPath === '/' ? '/' : cleanPath}`;
}

/** Canonical URL for a post, e.g. `/posts/hello-astro/` or `/zh/posts/hello-astro/`. */
export function postUrl(locale: Locale, slug: string) {
  return locale === defaultLocale ? `/posts/${slug}/` : `/${locale}/posts/${slug}/`;
}

/** Canonical URL for a tag page, e.g. `/tags/finance/` or `/zh/tags/finance/`. */
export function tagUrl(locale: Locale, tag: string) {
  const encoded = encodeURIComponent(tag);
  return locale === defaultLocale ? `/tags/${encoded}/` : `/${locale}/tags/${encoded}/`;
}

/** Path to the generated OG image for a post, e.g. `/og/hello-astro.png` or `/zh/og/hello-astro.png`. */
export function ogImagePath(locale: Locale, slug: string) {
  return locale === defaultLocale ? `/og/${slug}.png` : `/${locale}/og/${slug}.png`;
}
