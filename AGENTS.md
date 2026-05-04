# AGENTS.md - Agent Guide for This Project

## Overview

Astro static blog deployed on Cloudflare Pages.
Source: https://github.com/thedavidweng/blog

```
src/content/posts/   ← posts (subdirs: en/, zh/, .md files)
public/posts/<slug>/ ← post images
src/                 ← site code (Astro + TypeScript)
tests/               ← contract tests
```

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

## Code Style

- Add a half-width space between Chinese and English/digits.
- Use full-width punctuation for Chinese text, half-width for English.
- Preserve correct capitalization for proper nouns (SafePal, Wealthsimple, etc.).

## Deployment

Pushing to `main` triggers Cloudflare Pages automatic deployment.
Build command: `pnpm build`, output directory: `dist`.
