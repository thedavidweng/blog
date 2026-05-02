import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import { rehypeFigureCaptions } from './src/plugins/rehype-figure-captions.ts';
import { rehypeLazyImages } from './src/plugins/rehype-lazy-images.ts';
import { remarkReadingTime } from './src/plugins/remark-reading-time.ts';
import remarkLinkCard from 'remark-link-card';
import expressiveCode from 'astro-expressive-code';
import { siteConfig } from './src/site.config.ts';

const site = process.env.PUBLIC_SITE_URL || process.env.CF_PAGES_URL || 'http://localhost:4321';

const integrations = [
  sitemap({
    i18n: {
      defaultLocale: 'en',
      locales: {
        en: 'en',
        zh: 'zh-CN'
      }
    }
  })
];

if (siteConfig.features.expressiveCode) {
  integrations.push(
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      useThemedScrollbars: false,
      useThemedSelectionColors: false,
      themeCssSelector: (theme, { styleVariants }) => `[data-theme='${theme.name === 'github-dark' ? 'dark' : 'light'}']`
    })
  );
}

const remarkPlugins = [];
if (siteConfig.features.readingTime) {
  remarkPlugins.push(remarkReadingTime);
}
if (siteConfig.features.linkCard) {
  remarkPlugins.push([remarkLinkCard, { shortenUrl: true }]);
}

export default defineConfig({
  site,
  output: 'static',

  integrations,

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      defaultColor: false
    },
    remarkPlugins,
    rehypePlugins: [rehypeFigureCaptions, rehypeLazyImages]
  },

  vite: {
    plugins: [tailwindcss()]
  }
});