# ADR-0009: All UI copy in the i18n table

Date: 2026-07-25

## Context

Page titles, descriptions, aria labels, and per-locale phrases were inline `locale === 'zh' ? … : …` ternaries across ~10 components (26 occurrences), while `src/config/i18n.ts` already existed for exactly this. `content.ts` carried presentation strings (`publishedLabel`, `tagLabel`). Answering "what does the Tags page say in zh?" required reading component code.

## Decision

Every UI string lives in the `ui` table in `src/config/i18n.ts`, read through `t(locale)`. Date and tag label formatting (`publishedLabel`, `tagLabel`) live in the same module. Locale *metadata* (BCP-47 `localeTag`, OpenGraph `ogLocaleTag`) lives in the Locale module, not the copy table.

## Rationale

- **Locality**: all zh copy is one diffable table; a translation review needs one file.
- **Leverage**: a third locale is a new table entry plus a `locales` entry — no component edits.
- `content.ts` stops mixing querying with presentation.

## Consequences

- Components take copy via `t(locale).<key>`; parameterized strings are functions in the table.
- The Sidebar serializes the table (both locales) into its client script instead of re-inlining strings — see ADR-0010.
