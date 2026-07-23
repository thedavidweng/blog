# David Blog

Pure static bilingual blog built with Astro 6, Markdown content collections, build-time Open Graph images, RSS, sitemap, and Cloudflare Pages configuration.

## Tech Stack & Integrations

### Core Framework
- **Astro 6**: Core framework for generating blazing-fast static pages.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI styling.

### Typography & Writing
- **Tailwind Typography (Prose)**: Custom, zero-dependency implementation for highly readable Chinese/English typography and rich markdown styling.
- **Reading Time**: Automatically calculates and displays estimated reading time for dual-language posts.
- **MDX**: Support for using Astro components directly inside Markdown content, enabling custom interactive elements and manual link cards.
- **Rehype Slug**: Automatically adds IDs to Markdown headings, enabling anchor linking and supporting **Tocbot**'s navigation.
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

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_SITE_URL` | Yes | Production site URL (e.g. `https://blog.blahaj.uk`). Used to generate absolute URLs for OG images, canonical links, and sitemap. Without this, all URLs default to `http://localhost:4321` and social media platforms cannot fetch OG images. |

Set this in **Cloudflare Pages → Settings → Environment variables** (Production).

### Cloudflare Pages

- Build command: `pnpm run build`
- Output directory: `dist`
- Node version: from `mise.toml`

## Content

Posts live in paired Markdown files:

- `src/content/posts/en/<slug>.md`
- `src/content/posts/zh/<slug>.md`

Every published slug must exist in both languages. Tag IDs live in `src/site.config.ts` and render as localized labels.

Post images live in `public/posts/<slug>/` as AVIF files. See [`docs/image-workflow.md`](docs/image-workflow.md) for the rationale (why `public/` instead of `src/`), the AVIF conversion parameters, and the conversion procedure.

### Frontmatter Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Post title |
| `description` | string | Yes | Post description |
| `publishedDate` | date | Yes | Publication date |
| `updatedDate` | date | No | Last updated date |
| `tags` | string[] | Yes | At least one tag from `siteConfig.tags` |
| `draft` | boolean | No | Exclude from production build (default: `false`) |
| `slug` | string | No | Override default slug (derived from filename) |
| `locale` | `en` \| `zh` | No | Override locale (inferred from directory) |
| `narrowFigures` | boolean | No | Cap figure image width |
| `related` | string[] | No | Slugs of related posts to display at the bottom |

## Static Outputs

- English RSS: `/rss.xml`
- Chinese RSS: `/zh/rss.xml`
- Sitemap index: `/sitemap-index.xml`
- LLM summary: `/llms.txt`
- Example OG image: `/og/hello-astro.png`
- Chinese OG image: `/zh/og/hello-astro.png`
