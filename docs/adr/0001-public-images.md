# ADR-0001: Article images in `public/` instead of `src/`

Date: 2026-07-22

## Context

Astro recommends placing local images in `src/` so the build pipeline can optimize them (format conversion, responsive srcset, lazy loading, CLS prevention). This blog uses manually pre-optimized AVIF files for all article images.

## Decision

Store article images in `public/posts/<slug>/` as AVIF files, served as-is without Astro's build-time processing.

## Rationale

- AVIF is already the most efficient web image format. Astro's re-encoding pipeline would decode AVIF and re-encode as WebP (quality 80) or AVIF (quality 50) — a net loss.
- Blog post images display at a fixed width; responsive multi-size generation offers marginal benefit.
- Re-encoding dozens of screenshots per build is non-trivial on Cloudflare Pages. `public/` images are copied unchanged, keeping builds fast.
- Markdown authoring is simpler with URL paths (`![alt](/posts/slug/image.avif)`) than ESM imports or `image()` schema.

## Consequences

- No auto-generated `srcset` for responsive sizing.
- No auto-injected lazy loading or CLS prevention (handled by `lazy-images` Sätteri plugin instead).
- Image format enforcement relies on `scripts/check-image-formats.js` rather than the build pipeline.
