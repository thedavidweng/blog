# David Blog

Pure static bilingual blog built with Astro 6, Markdown content collections, build-time Open Graph images, RSS, sitemap, and Cloudflare Pages configuration.

## Tech Stack & Integrations

- **Astro 6**: Core framework for generating blazing-fast static pages.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI styling.
- **Tailwind Typography (Prose)**: Custom, zero-dependency implementation for highly readable Chinese/English typography and rich markdown styling.
- **Giscus**: Lightweight, database-free, and theme-aware commenting system powered by GitHub Discussions. Supports cross-language unified comment threads.
- **Medium-Zoom**: Vanilla JS, zero-dependency library providing silky-smooth, Medium-style image lightbox zooming.
- **Astro Expressive Code**: Advanced code block syntax highlighting with Mac-style window controls and copy buttons.
- **Tocbot**: Vanilla JS auto-generated sticky Table of Contents with scroll-spy.
- **Remark Link Card**: Automatically converts raw URLs into beautiful, Notion-style rich link preview cards.
- **Reading Time**: Automatically calculates and displays estimated reading time for dual-language posts.

## Commands

We use `pnpm` as the strict package manager for speed and consistency.

```bash
pnpm install
pnpm run dev
pnpm run check
pnpm run build
pnpm run preview
```

### Keeping Dependencies Updated
To upgrade all dependencies to their absolute latest versions, simply run:
```bash
pnpm up --latest
```

Cloudflare Pages:

- Build command: `pnpm run build`
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
