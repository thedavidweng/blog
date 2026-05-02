# David Blog

Pure static bilingual blog built with Astro 6, MDX content collections, build-time Open Graph images, RSS, sitemap, and Cloudflare Pages configuration.

## Commands

```bash
npm install
npm run dev
npm run check
npm run build
npm run preview
```

Cloudflare Pages:

- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22`
- Optional production URL variable: `PUBLIC_SITE_URL=https://your-domain.example`

## Content

Posts live in paired MDX files:

- `src/content/posts/en/<slug>.mdx`
- `src/content/posts/zh/<slug>.mdx`

Every published slug must exist in both languages. Tag IDs live in `src/site.config.ts` and render as localized labels.

## Static Outputs

- English RSS: `/rss.xml`
- Chinese RSS: `/zh/rss.xml`
- Sitemap index: `/sitemap-index.xml`
- LLM summary: `/llms.txt`
- Example OG image: `/og/hello-astro.png`
- Chinese OG image: `/zh/og/hello-astro.png`
