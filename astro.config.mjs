import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import { figureCaptionsPlugin } from './src/plugins/figure-captions.ts';
import { lazyImagesPlugin } from './src/plugins/lazy-images.ts';
import { readingTimePlugin } from './src/plugins/reading-time.ts';
import { linkCardPlugin } from './src/plugins/link-card.ts';
import expressiveCode from 'astro-expressive-code';

const site = process.env.PUBLIC_SITE_URL || process.env.CF_PAGES_URL || 'http://localhost:4321';

export default defineConfig({
  site,
  output: 'static',

  integrations: [
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      useThemedScrollbars: false,
      useThemedSelectionColors: false,
      themeCssSelector: (theme) =>
        `[data-theme='${theme.name === 'github-dark' ? 'dark' : 'light'}']`,
    }),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          zh: 'zh-CN',
        },
      },
    }),
  ],

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
    },
    processor: satteri({
      mdastPlugins: [readingTimePlugin, () => linkCardPlugin({ shortenUrl: true })],
      hastPlugins: [lazyImagesPlugin, figureCaptionsPlugin],
    }),
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
