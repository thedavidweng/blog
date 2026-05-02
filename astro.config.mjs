import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import { rehypeFigureCaptions } from './src/plugins/rehype-figure-captions.ts';
import { rehypeLazyImages } from './src/plugins/rehype-lazy-images.ts';

const site = process.env.PUBLIC_SITE_URL || process.env.CF_PAGES_URL || 'http://localhost:4321';

export default defineConfig({
  site,
  output: 'static',

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          zh: 'zh-CN'
        }
      }
    })
  ],

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      defaultColor: false
    },
    rehypePlugins: [rehypeFigureCaptions, rehypeLazyImages]
  },

  vite: {
    plugins: [tailwindcss()]
  }
});