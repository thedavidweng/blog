import { OGImageRoute } from 'astro-og-canvas';
import { assertTranslatedPostPairs } from '../../../lib/content';

const fonts = [
  'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@5.2.9/chinese-simplified-400-normal.ttf',
  'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@5.2.9/chinese-simplified-700-normal.ttf'
];
// CanvasKit exposes these Fontsource TTFs under this family name.
const fontFamilies = ['Noto Sans SC Thin', 'Noto Sans'];

const pairs = await assertTranslatedPostPairs();
const pages = Object.fromEntries(
  pairs.map(({ slug, posts }) => [
    slug,
    {
      title: posts.zh.data.title,
      description: posts.zh.data.description
    }
  ])
);

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'slug',
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[16, 16, 17]],
    border: {
      color: [125, 211, 252],
      width: 12,
      side: 'inline-start'
    },
    padding: 72,
    fonts,
    font: {
      title: {
        color: [244, 244, 245],
        size: 72,
        weight: 'Bold',
        lineHeight: 1.06,
        families: fontFamilies
      },
      description: {
        color: [165, 165, 171],
        size: 34,
        weight: 'Normal',
        lineHeight: 1.28,
        families: fontFamilies
      }
    }
  })
});
