# Domain Glossary

Terms the code, tests, and ADRs use. When naming a module or prop, use these words.

- **Post** — one article in one language. Identified by `<locale>/<filename>` in the content collection; its **slug** (frontmatter override or filename) is language-independent.
- **Translation pair** — the en + zh Posts sharing one slug. Only complete pairs are published as pages (`translatedPairs` in `src/lib/posts.ts`); incomplete pairs are skipped with a warning.
- **Locale** — `en` (default, unprefixed URLs) or `zh` (`/zh/` prefix). The Locale module (`src/lib/locale.ts`, ADR-0002) owns both directions of the prefix rule and the BCP-47 / OpenGraph tags. No other module may parse or build the prefix.
- **UI copy** — every human-readable interface string. Lives in the `ui` table in `src/config/i18n.ts`, read through `t(locale)`. Post content is not UI copy.
- **Tag** — a canonical id (e.g. `Finance`) with per-locale labels in the `tags` table in `src/config/i18n.ts`. Posts reference ids; pages render labels via `tagLabel`.
- **Link card** — the rich preview a bare URL paragraph (Sätteri plugin) or an `<LinkCard>` MDX component renders. One markup builder, `createLinkCard` in `src/plugins/link-card.ts`; both are adapters over it (ADR-0008).
- **Feed** — a locale's RSS output. Owned end-to-end by `rssResponse(locale)` in `src/lib/rss.ts`.
- **OG image** — the social-share PNG generated at build time. Posts get one per locale; non-post pages share the reserved `site` image (`SITE_OG_SLUG` in `src/lib/og.ts`).
- **Main content** — what `<main id={MAIN_CONTENT_ID}>` wraps; the part the Cloudflare middleware converts to Markdown for AI crawlers (ADR-0005). The id constant lives in `src/lib/markdown-response.ts`.
