# ADR-0007: Dissolve locale-routing into feed, static-paths, and page-local JSON-LD

Date: 2026-07-25

## Context

`src/lib/locale-routing.ts` held five functions with no shared state and one consumer each: two static-path builders, `getOgPages`, `getRssItems`, and a 44-line `getHomeJsonLd`. The RSS feed was split across two modules (`rss.ts` called back into `locale-routing.getRssItems`), and the home JSON-LD had nothing to do with routing. The module's interface was as wide as its implementation.

## Decision

- `src/lib/rss.ts` owns the whole feed: items, OG enclosures, and the response. `rssResponse(locale)` is the only export.
- `src/lib/static-paths.ts` keeps what the name promises: `getPostStaticPaths`, `getTagStaticPaths`, `getOgPages`.
- The home JSON-LD moved into `HomePage.astro`, next to its only caller — matching how About and Post pages build theirs.
- `src/lib/locale-routing.ts` is deleted.

## Rationale

- **Locality**: changing the feed touches one module; the JSON-LD sits with the page it describes.
- **Depth**: `rssResponse(locale)` is one interface with everything behind it.

## Consequences

- Route files import `getStaticPaths` helpers from `lib/static-paths`.
- `getOgPages` also serves the reserved `site` OG entry (see `SITE_OG_SLUG`), so non-post pages have a locale-aware default share image instead of borrowing a post's.
