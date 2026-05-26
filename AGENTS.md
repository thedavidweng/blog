# AGENTS.md - Agent Guide for This Project

## Overview

Astro static blog deployed on Cloudflare Pages.
Source: https://github.com/thedavidweng/blog

```
src/content/posts/   ← posts (subdirs: en/, zh/, .md files)
public/posts/<slug>/ ← post images (AVIF only, see docs/image-workflow.md)
src/                 ← site code (Astro + TypeScript)
tests/               ← contract tests
```

## Images

All article images must be in `public/posts/<slug>/` as **AVIF** files.

- **Why `public/` instead of `src/`**: Article images are manually pre-optimized as AVIF. Astro's build-time pipeline would decode and re-encode them (default: WebP quality 80), which is a net loss for already-optimal AVIF files. `public/` copies them as-is, keeping builds fast. Full rationale in `docs/image-workflow.md`.
- **How to convert**: Use `pnpm exec tsx scripts/convert-to-avif.mjs <input> <slug>`. This creates the directory, converts to AVIF (quality 65, effort 6), and deletes originals.
- **CI enforcement**: `pnpm check` includes `check:images`, which fails if `.png`/`.jpg`/`.jpeg`/`.gif`/`.webp` are found in `public/`.

## Common Commands

```bash
pnpm dev              # local dev server
pnpm build           # build (also run by CI)
pnpm check           # astro check + all tests (run before committing)
pnpm test:content   # content contract test (frontmatter validation)
pnpm test:source    # source contract test
pnpm test:dist      # build output contract test
```

## Post Conventions

- Every post has both `en` and `zh` versions; slugs must match (used for bilingual pairing).
- Frontmatter schema is defined in `src/content.config.ts`.
- **YAML 1.2 boolean pitfall**: Only `true`/`false`/`True`/`False`/`TRUE`/`FALSE` are booleans. `no`/`yes`/`on`/`off` are strings and will cause `z.boolean()` validation to fail. **Write `draft: false`, not `draft: no`**.
- Posts with `draft: true` are excluded from translation pairing checks.
- Tags must be registered in `siteConfig.tags` in `src/site.config.ts`.
- **Related posts**: Use `related: [slug1, slug2]` in frontmatter to link related posts — do **not** add manual link sections at the end of post body. The `related` field is defined in `src/content.config.ts`.

## Writing Style

All content must follow the writing style guide in `docs/writing-style-guide.md`. Key requirements:

- Direct, factual, no fluff — express through facts, not adjectives
- Short paragraphs (1–3 sentences), no em dashes or semicolons
- Half-width space between Chinese and English/digits
- Full-width punctuation for Chinese, half-width for English
- Proper noun capitalization (SafePal, Wealthsimple, GitHub, iOS)
- No cheesy endings, filler phrases, or false familiarity
- Data/timeline entries: action and result only — no commentary
- End immediately after final result — no summary or 展望

## OG Images

OG images are generated at build time by `astro-og-canvas` and output to `dist/og/` — they are **not** committed to `public/og/`. The `public/og/` directory is empty by design. Do NOT report OG images as missing just because `public/og/` is empty; check `dist/og/` instead.

Generation code lives in `src/pages/og/[...slug].ts` (EN) and `src/pages/zh/og/[...slug].ts` (ZH). Uses CanvasKit WASM for rendering. Images are served statically by Cloudflare Pages CDN at `/og/<slug>.png`.

## Deployment

Pushing to `main` triggers Cloudflare Pages automatic deployment.
Build command: `pnpm build`, output directory: `dist`.
