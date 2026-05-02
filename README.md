# David Blog

Pure static bilingual blog built with Astro 6, Markdown content collections, build-time Open Graph images, RSS, sitemap, and Cloudflare Pages configuration.

## Tech Stack & Integrations

### Core Framework
- **Astro 6**: Core framework for generating blazing-fast static pages.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI styling.

### Typography & Writing
- **Tailwind Typography (Prose)**: Custom, zero-dependency implementation for highly readable Chinese/English typography and rich markdown styling.
- **Reading Time**: Automatically calculates and displays estimated reading time for dual-language posts.
- **MDAST Util To String**: A unified ecosystem utility to extract pure text from Markdown ASTs for accurate metadata processing.

### Interactive Experience
- **Giscus**: Lightweight, database-free, and theme-aware commenting system powered by GitHub Discussions. Supports cross-language unified comment threads.
- **Medium-Zoom**: Vanilla JS, zero-dependency library providing silky-smooth, Medium-style image lightbox zooming.
- **Tocbot**: Vanilla JS auto-generated sticky Table of Contents with scroll-spy.

### Rich Content & Code
- **Astro Expressive Code**: Advanced code block syntax highlighting with Mac-style window controls and copy buttons.
- **Remark Link Card**: Automatically converts raw URLs into beautiful, Notion-style rich link preview cards.

### Automated Assets
- **Astro OG Canvas & CanvasKit**: Build-time dynamic Open Graph image generation using the Skia (CanvasKit WASM) engine. Automatically renders post titles and descriptions with multi-language font support (Noto Sans SC).

## Commands

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
