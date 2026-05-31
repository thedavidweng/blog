export const defaultLocale = 'en' as const;
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];
