/** Locale-prefix pattern and all locale-aware URL generation. See ADR-0002. */

export const defaultLocale = 'en' as const;
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function alternateLocale(locale: Locale): Locale {
  return locales.find((l) => l !== locale) ?? defaultLocale;
}

/** BCP-47 tag for html lang, hreflang, and JSON-LD inLanguage. */
export const localeTag: Record<Locale, string> = { en: 'en', zh: 'zh-CN' };

export const ogLocaleTag: Record<Locale, string> = { en: 'en_US', zh: 'zh_CN' };

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

/** Inverse of `localizedPath`, e.g. `delocalizePath('/zh/tags/')` → `/tags/`. */
export function delocalizePath(path: string) {
  for (const locale of locales) {
    const base = getLocaleBase(locale);
    if (!base) continue;
    if (path === base) return '/';
    if (path.startsWith(`${base}/`)) return path.slice(base.length);
  }
  return path;
}
