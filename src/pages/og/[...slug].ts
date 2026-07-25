import { OGImageRoute } from 'astro-og-canvas';
import { getOgPages } from '../../lib/static-paths';
import { ogImageOptions } from '../../lib/og';

const pages = await getOgPages('en');

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => ogImageOptions(page, 'en'),
});
