# ADR-0008: One link-card markup builder, two adapters

Date: 2026-07-25

## Context

Two implementations emitted the `rlc-*` link-card markup: the Sätteri plugin (`createLinkCard`) for bare URL paragraphs, and `LinkCard.astro` for MDX. Both coupled to class names defined in `global.css`, and they had already diverged — the component had `target="_blank" rel="noopener noreferrer"`, a `not-prose` wrapper, and a retina favicon; the plugin had none.

## Decision

`createLinkCard(data)` in `src/plugins/link-card.ts` is the only source of the card's markup. The plugin and `LinkCard.astro` (via `set:html`) are two adapters over it. The builder escapes all interpolated values itself; fetchers return raw text.

## Rationale

- **Locality**: a markup or class change happens once; drift between the two render paths is structurally impossible.
- **Leverage**: `link-card.test.ts` covers both adapters through one interface.
- Escaping at the output seam removes the "was this field pre-escaped?" question from every producer.

## Consequences

- Plugin-rendered cards gained `target="_blank" rel="noopener noreferrer"`, lazy image attributes, and the `not-prose` wrapper.
- `pickDescription`/`createDefaultFetcher` return raw text; only `createLinkCard` escapes.
