# ADR-0004: Shared OG image configuration

Date: 2026-07-22

## Context

Two OG image route files (`src/pages/og/[...slug].ts` and `src/pages/zh/og/[...slug].ts`) were 95% identical — same gradient, border, padding, colors, layout. They differed only in font URLs (Latin vs Noto Sans SC), font family names, and title size (74 vs 72). Changing the OG visual style meant editing two files.

## Decision

Extract a shared `ogImageOptions(page, locale)` function in `src/lib/og.ts` that owns the visual design and parameterizes font selection and sizing by locale. Each OG route file becomes a thin adapter that calls the shared config with its locale.

## Rationale

- **Locality**: OG visual design changes hit one module, not two.
- **Leverage**: A third locale's OG images need only a font entry, not a new 44-line file.
- **Testability**: The config function is testable directly — `ogImageOptions(page, 'zh').fonts` includes `noto-sans-sc` — replacing the brittle string-matching tests that previously verified this.

## Consequences

- The shared visual config (gradient, border, padding, colors) lives in `src/lib/og.ts`, not in the route files.
- Locale-specific font differences are the only thing behind the per-locale seam.
