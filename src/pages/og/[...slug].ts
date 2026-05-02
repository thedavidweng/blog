import { OGImageRoute } from 'astro-og-canvas';
import { assertTranslatedPostPairs } from '../../lib/content';

const fonts = [
  'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@5.2.9/latin-400-normal.ttf',
  'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@5.2.9/latin-700-normal.ttf'
];

const pairs = await assertTranslatedPostPairs();
const pages = Object.fromEntries(
  pairs.map(({ slug, posts }) => [
    slug,
    {
      title: posts.en.data.title,
      description: posts.en.data.description
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
        size: 74,
        weight: 'Bold',
        lineHeight: 1.04,
        families: ['Noto Sans']
      },
      description: {
        color: [165, 165, 171],
        size: 36,
        weight: 'Normal',
        lineHeight: 1.22,
        families: ['Noto Sans']
      }
    }
  })
});
