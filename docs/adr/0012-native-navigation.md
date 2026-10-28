# ADR-0012: Native navigation, build-time TOC, prop-only link cards

Date: 2026-10-28

## Context

Every page shipped Astro's `ClientRouter` (16 KB), and post pages added `tocbot` (12 KB) to build a table of contents the server already knew. The router forced `astro:page-load`/`astro:after-swap` glue into five components and a persisted sidebar that re-localized itself on the client (ADR-0010). The bare-URL link-card plugin fetched Open Graph data over the network on every build, but no post used it; the only link card is the MDX component with explicit props (ADR-0008).

## Decision

- Navigation is plain multi-page: `@view-transition { navigation: auto; }` crossfades content, `view-transition-name` keeps the sidebar and toolbar still, and a Speculation Rules block prerenders same-origin links on hover.
- `Toc.astro` renders the list from `render(post).headings`; a small scroll handler only sets `aria-current` on the active link.
- `LinkCard.astro` is the only link-card renderer. It takes props and relies on Astro escaping. The Sätteri plugin and `open-graph-scraper` are gone.

## Consequences

- Browsers without cross-document view transitions or speculation rules navigate normally; nothing breaks.
- Scripts run once per page load, so components no longer listen for router events.
- A future bare-URL card needs explicit props in MDX instead of a build-time fetch.
