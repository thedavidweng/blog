# David Blog

Pure static bilingual blog built with Astro 6, Markdown content collections, build-time Open Graph images, RSS, sitemap, and Cloudflare Pages configuration.

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
- Node version: `25.9.0` from `.nvmrc`
- Optional production URL variable: `PUBLIC_SITE_URL=https://your-domain.example`

## Content

Posts live in paired Markdown files:

- `src/content/posts/en/<slug>.md`
- `src/content/posts/zh/<slug>.md`

Every published slug must exist in both languages. Tag IDs live in `src/site.config.ts` and render as localized labels.

## Static Outputs

- English RSS: `/rss.xml`
- Chinese RSS: `/zh/rss.xml`
- Sitemap index: `/sitemap-index.xml`
- LLM summary: `/llms.txt`
- Example OG image: `/og/hello-astro.png`
- Chinese OG image: `/zh/og/hello-astro.png`
