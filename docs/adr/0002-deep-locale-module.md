# ADR-0002: Deep Locale module for URL generation

Date: 2026-07-22

## Context

The locale concept — which locales exist, how URLs are prefixed, how posts/tags/OG/RSS are localized — was spread across five files (`config/locale.ts`, `config/i18n.ts`, `site.config.ts`, `lib/content.ts`, `lib/locale-routing.ts`). The same `locale === defaultLocale ? '' : /${locale}` prefix pattern was duplicated in five functions across two files. Understanding how a localized URL is built required bouncing through four modules.

## Decision

Consolidate all locale-aware URL generation into a single `src/lib/locale.ts` module. This module owns:

- Locale constants (`defaultLocale`, `locales`, `Locale` type)
- `isLocale` type guard
- `getLocaleBase` / `localizedPath` — the prefix strategy
- `postUrl`, `tagUrl`, `ogImagePath` — locale-aware URL builders

`content.ts` keeps content-collection operations (fetching, filtering, pairing). `locale-routing.ts` keeps Astro-specific static-path assembly. Neither re-implements URL prefixing.

## Rationale

- **Locality**: The locale-prefix decision lives in one place. Changing the URL scheme (adding a third locale, moving zh to a subdomain) requires editing one module, not five functions across two files.
- **Leverage**: Every page, component, and route that builds a localized URL crosses one seam.
- **Testability**: The locale-prefix logic is testable through one interface (`postUrl('zh', 'hello')` → `/zh/posts/hello/`) instead of being smeared across functions that also do content fetching.

## Consequences

- `content.ts` re-exports `postUrl`, `tagUrl`, `ogImagePath` from `locale.ts` for backward compatibility with existing imports.
- `site.config.ts` re-exports `defaultLocale`, `locales`, `localizedPath`, `Locale` for the same reason.
- The old `src/config/locale.ts` file is deleted; its contents live in `src/lib/locale.ts`.
