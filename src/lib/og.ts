import type { Locale } from './locale';

/**
 * OG image configuration — owns the visual design (gradient, border, padding, colors)
 * and parameterizes font selection and sizing by locale.
 * See ADR-0004 for the decision record.
 */

const SHARED = {
  bgGradient: [[16, 16, 17]] as Array<[number, number, number]>,
  border: {
    color: [125, 211, 252] as [number, number, number],
    width: 12,
    side: 'inline-start' as const,
  },
  padding: 72,
};

const FONT_CONFIGS: Record<Locale, {
  fonts: string[];
  families: string[];
  titleSize: number;
  titleLineHeight: number;
  descSize: number;
  descLineHeight: number;
}> = {
  en: {
    fonts: [
      'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@5.2.9/latin-400-normal.ttf',
      'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@5.2.9/latin-700-normal.ttf',
    ],
    families: ['Noto Sans'],
    titleSize: 74,
    titleLineHeight: 1.04,
    descSize: 36,
    descLineHeight: 1.22,
  },
  zh: {
    fonts: [
      'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@5.2.9/chinese-simplified-400-normal.ttf',
      'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@5.2.9/chinese-simplified-700-normal.ttf',
    ],
    // CanvasKit exposes these Fontsource TTFs under this family name.
    families: ['Noto Sans SC Thin', 'Noto Sans'],
    titleSize: 72,
    titleLineHeight: 1.06,
    descSize: 34,
    descLineHeight: 1.28,
  },
};

/** Build the `getImageOptions` payload for `OGImageRoute`, parameterized by locale. */
export function ogImageOptions(
  page: { title: string; description: string },
  locale: Locale,
) {
  const cfg = FONT_CONFIGS[locale];
  return {
    title: page.title,
    description: page.description,
    bgGradient: SHARED.bgGradient,
    border: SHARED.border,
    padding: SHARED.padding,
    fonts: cfg.fonts,
    font: {
      title: {
        color: [244, 244, 245] as [number, number, number],
        size: cfg.titleSize,
        weight: 'Bold' as const,
        lineHeight: cfg.titleLineHeight,
        families: cfg.families,
      },
      description: {
        color: [165, 165, 171] as [number, number, number],
        size: cfg.descSize,
        weight: 'Normal' as const,
        lineHeight: cfg.descLineHeight,
        families: cfg.families,
      },
    },
  };
}
