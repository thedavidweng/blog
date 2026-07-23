# ADR-0003: Shared page components for locale deduplication

Date: 2026-07-22

## Context

Every page had a near-identical `zh/` counterpart — 7 page pairs totaling ~400 lines of duplicated logic. The `zh/` versions differed only in the locale constant, hardcoded UI strings, and import path depth. Any logic change had to be applied twice, and the copies could silently drift.

## Decision

Extract each page's body into a shared component (`src/components/pages/`) that accepts `locale` as a prop. Route files become 3–10 line wrappers that pass the locale and handle `getStaticPaths`. Hardcoded strings move to the i18n translation map or are derived from the locale prop.

Shared components created:
- `HomePage.astro` — home/index page
- `TagsIndexPage.astro` — tag listing page
- `TagDetailPage.astro` — individual tag page
- `AboutPage.astro` — about page

RSS feeds share a `rssResponse(locale)` function in `src/lib/rss.ts`.

## Rationale

- **Locality**: Layout changes are made once, not twice. Drift between en and zh becomes structurally impossible.
- **Leverage**: Adding a third locale means adding thin wrappers, not copying 30-line pages.
- **Testability**: Shared page components can be tested with both locales through the `locale` prop seam.

## Consequences

- Route files still exist for both locales (Astro's file-based routing requires them), but they are thin wrappers with no logic.
- `getStaticPaths` must remain in the route file (Astro requirement), not in the shared component.
