import { OGImageRoute } from 'astro-og-canvas';
import { getOgPages } from '../../../lib/locale-routing';
import { ogImageOptions } from '../../../lib/og';

const pages = await getOgPages('zh');

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'slug',
  pages,
  getImageOptions: (_path, page) => ogImageOptions(page, 'zh'),
});
