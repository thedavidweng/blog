import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';

import tailwindcss from '@tailwindcss/vite';

import { rehypeFigureCaptions } from './src/plugins/rehype-figure-captions.ts';
import { rehypeLazyImages } from './src/plugins/rehype-lazy-images.ts';
import rehypeSlug from 'rehype-slug';
import { remarkReadingTime } from './src/plugins/remark-reading-time.ts';
import remarkLinkCard from './src/plugins/remark-link-card.ts';
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
    processor: unified({
      remarkPlugins: [remarkReadingTime, [remarkLinkCard, { shortenUrl: true }]],
      rehypePlugins: [rehypeSlug, rehypeFigureCaptions, rehypeLazyImages],
    }),
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
