---
title: "Building a fast static blog with Astro"
locale: en
description: "A minimal bilingual blog that keeps content in Git, ships static HTML, and generates Open Graph images at build time."
publishedDate: 2026-04-30
tags:
  - Tools
  - Writing
---

## Why Astro

Astro is a practical fit for a personal blog when the core requirement is speed. The content lives in Markdown, the repository is the source of truth, and the deployed site can stay entirely static — no server, no database, no runtime JavaScript shipped to the client unless explicitly opted in.

Astro 6 is the current major version. It uses Vite as the build engine, supports content collections with built-in Zod schema validation, and ships zero JS by default for static pages. Interactive components (comments, image zoom, table of contents) are islanded on a per-component basis, so only the minimal JS needed for each feature reaches the browser.

## The Full Stack, Package by Package

### Core Framework

- **astro (^6.2.2)** — The core framework. Handles routing, content collections, static generation, and the Vite-powered dev server. All pages are rendered to plain HTML at build time. The dev server runs on `localhost:4321` by default.
- **@astrojs/mdx (^5.0.4)** — MDX integration for Astro. Allows writing `.mdx` files that import and use Astro components directly inside Markdown. This is what enables custom interactive elements like manual link cards or embedded demos within post content.

### Styling

- **tailwindcss (^4.2.4)** — Tailwind CSS v4, the utility-first CSS framework. Used for all layout, spacing, typography, and responsive design. Tailwind v4 uses a CSS-first configuration approach (no `tailwind.config.js` needed) and has significantly faster build times than v3.
- **@tailwindcss/vite (^4.2.4)** — The Vite plugin for Tailwind CSS v4. Integrates Tailwind directly into the Vite dev server pipeline for instant HMR during development.
- **@tailwindcss/typography (^0.5.19)** — Provides the `prose` class for styling raw HTML/Markdown output. In this blog, a custom zero-dependency prose implementation was built on top of it to handle both Chinese and English typography with appropriate font stacks, spacing, and rich Markdown element styling (blockquotes, tables, code blocks, etc.).

### Content & Markdown Processing

- **astro/loaders (glob)** — Built-in Astro content loader. Scans `src/content/posts/**/*.md` at build time and feeds files into the content collection. The `generateId` option strips the `.md` extension to produce clean entry IDs.
- **astro/zod** — Zod schema validation integrated into Astro content collections. Every post's frontmatter is validated at build time against the schema defined in `src/content.config.ts`. This catches typos, missing fields, and type mismatches before they reach production. For example, `draft: no` (YAML 1.2 string) would fail `z.boolean()` validation — it must be `draft: false`.
- **rehype-slug (^6.0.0)** — Rehype plugin that automatically adds `id` attributes to Markdown headings (`h1`–`h6`). This enables anchor linking (e.g., `#my-section`) and is a prerequisite for Tocbot's scroll-spy navigation to work.
- **mdast-util-to-string (^4.0.0)** — MDAST (Markdown Abstract Syntax Tree) utility that extracts plain text from a Markdown AST. Used to strip Markdown formatting from post content for accurate reading time calculation and metadata processing.
- **unist-util-visit (^5.1.0)** — Generic AST visitor utility for the Unified ecosystem. Used to traverse and manipulate Markdown/AST nodes during build — for example, to process link nodes for the link card feature.
- **reading-time (^1.5.0)** — Estimates reading time based on word count and average reading speed. Displays "X min read" on each post. Handles both English and Chinese text segmentation for accurate estimates across languages.
- **turndown (^7.2.4)** — HTML-to-Markdown converter. Used in the build pipeline to convert scraped webpage content into Markdown for the link card feature.
- **sanitize-filename (^1.6.4)** — Sanitizes strings for safe use in filenames. Used when generating file paths for OG images and other build artifacts derived from post titles.

### Code Blocks

- **astro-expressive-code (^0.42.0)** — Astro integration for Expressive Code, a syntax highlighting engine. Provides beautiful code blocks with Mac-style window controls (red/yellow/green dots), copy-to-clipboard buttons, line highlighting, and support for dozens of themes. Zero client-side JavaScript — all highlighting is done at build time.

### Rich Link Previews

- **remark-link-card** — A Remark plugin that automatically detects raw URLs in Markdown content and converts them into rich, Notion-style link preview cards. Each card includes the page title, description, and thumbnail image fetched from the target page's Open Graph metadata.
- **open-graph-scraper (^6.11.0)** — Scrapes Open Graph metadata (title, description, image) from URLs. Used at build time by the link card system to fetch preview data for external links.
- **probe-image-size (^7.3.0)** — Probes remote images for their dimensions without downloading the full file. Used alongside open-graph-scraper to validate and measure link preview images.
- **image-size (^2.0.2)** — Reads dimensions of local image files. Used for processing post images in the `public/posts/` directory.
- **he (^1.2.0)** — HTML entity encoder/decoder. Used for safely encoding text in OG image generation and other contexts where HTML entities need to be handled.

### Interactive Experience (Client-Side Islands)

These are the only JavaScript shipped to the browser. Each is loaded only on pages where it's needed.

- **giscus** — A commenting system powered by GitHub Discussions. It's lightweight, database-free, and theme-aware. Comments are stored as GitHub Discussions on the blog's repository, so there's no separate database to maintain. Supports cross-language unified comment threads — the English and Chinese versions of a post share the same discussion thread via a `data-lang` mapping.
- **medium-zoom (^1.1.0)** — A vanilla JS, zero-dependency library that provides Medium-style image lightbox zooming. Click any image in a post to zoom it in with a smooth animation. No framework, no dependencies, ~3KB gzipped.
- **tocbot (^4.36.6)** — A vanilla JS library that auto-generates a sticky Table of Contents from heading elements in the page. It includes scroll-spy (highlights the current section as you scroll) and works with the heading IDs added by `rehype-slug`. Renders as a sidebar on desktop and collapses on mobile.

### Automated Assets

- **astro-og-canvas (^0.11.1)** — Astro integration for generating Open Graph images at build time using the Canvas API. For each post, it renders a 1200×630 PNG with the post title, description, and site branding.
- **canvaskit-wasm (^0.41.1)** — A WebAssembly build of Google's Skia graphics engine. Used as the rendering backend for `astro-og-canvas`. Supports advanced text rendering with multi-language font loading — specifically Noto Sans SC for Chinese characters, ensuring CJK text renders correctly in OG images without fallback to system fonts.

### Icons

- **@fortawesome/free-brands-svg-icons (^7.2.0)** — Brand icons (GitHub, LinkedIn, X/Twitter, etc.) from Font Awesome. Used in the social links component and footer.
- **@lucide/astro (^1.14.0)** — Lucide icons as Astro components. Used for UI icons throughout the site (navigation, buttons, feature toggles). Tree-shakeable — only the icons actually used are included in the build.

### SEO & Feeds

- **@astrojs/rss (^4.0.18)** — Generates RSS feeds. Produces two feeds: `/rss.xml` for English posts and `/zh/rss.xml` for Chinese posts. Each feed includes full post content, publication dates, and proper metadata.
- **@astrojs/sitemap (^3.7.2)** — Generates a sitemap index at `/sitemap-index.xml`. Includes all published posts in both languages with proper `hreflang` alternates for SEO. Automatically excludes draft posts.

### Deployment & Infrastructure

- **Cloudflare Pages** — The hosting platform. Build command is `pnpm build`, output directory is `dist`. Node version is pinned to `25.9.0` via `.nvmrc`. Pushing to `main` triggers automatic deployment. Free tier includes unlimited bandwidth, automatic SSL, and global CDN.
- **wrangler (^4.87.0)** — Cloudflare's CLI tool. Used for manual deployment (`pnpm deploy`) and for local testing of Cloudflare Pages behavior.

### Development Tooling

- **typescript (^6.0.3)** — TypeScript for type-safe Astro components, configuration files, and build scripts.
- **@astrojs/check (^0.9.9)** — Runs Astro's built-in type checking (`astro check`). Validates content collection schemas, component props, and TypeScript types across the project.
- **tsx (^4.21.0)** — TypeScript executor. Used to run the test files (`tests/*.test.ts`) directly without a separate compilation step.

## Content Architecture

Posts live in paired Markdown files:

```
src/content/posts/en/<slug>.md
src/content/posts/zh/<slug>.md
```

Every published slug must exist in both languages. The slug is used to pair translations — the English and Chinese versions of a post are linked by their shared slug. Post images go in `public/posts/<slug>/`.

Frontmatter is validated at build time via Zod. The schema enforces: title (string), description (string), publishedDate (date), tags (non-empty array of strings from a predefined set), and optional fields like updatedDate, draft, slug, locale, narrowFigures, and related.

Tags are defined in `src/site.config.ts` with localized labels (e.g., `Tools` → `工具`). The `related` field accepts an array of slugs to display related posts at the bottom of each post page.

## Static Outputs

The build produces:

| Output | Path |
|--------|------|
| English RSS | `/rss.xml` |
| Chinese RSS | `/zh/rss.xml` |
| Sitemap index | `/sitemap-index.xml` |
| LLM summary | `/llms.txt` |
| OG image (EN) | `/og/<slug>.png` |
| OG image (ZH) | `/zh/og/<slug>.png` |

## Environment

One environment variable is required:

- `PUBLIC_SITE_URL` — The production site URL (e.g., `https://blog.blahaj.uk`). Used to generate absolute URLs for OG images, canonical links, and the sitemap. Without it, all URLs default to `http://localhost:4321` and social media platforms cannot fetch OG images. Set in Cloudflare Pages → Settings → Environment variables (Production).

## What It All Adds Up To

A site that is:

- **Fast** — Pure static HTML, zero JS by default, minimal client-side islands
- **Cheap** — Hosted on Cloudflare Pages free tier with unlimited bandwidth
- **Maintainable** — Content in Git, frontmatter validated at build time, automated asset generation
- **Bilingual** — Full English/Chinese support with paired posts, localized feeds, and CJK-aware OG images
- **Readable** — Custom typography for both languages, reading time estimates, progress bar, table of contents
- **Social** — Auto-generated OG images, rich link preview cards, RSS feeds for both languages
- **Interactive where it matters** — Comments via GitHub Discussions, image zoom, sticky TOC — all loaded only when needed
