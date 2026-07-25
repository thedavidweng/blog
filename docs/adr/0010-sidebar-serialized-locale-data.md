# ADR-0010: Sidebar client script consumes serialized locale data

Date: 2026-07-25

## Context

The sidebar and toolbar persist across view transitions (`transition:persist`), so a client script must re-localize them after each swap. That script had grown into a hand-rolled second implementation of the Locale module's rules: URL prefixing (`locale === 'en' ? '/' : '/zh/'`), nav order (`['posts','tags','about']`), and every aria label in both languages — bypassing the seam ADR-0002 established, with no tests.

## Decision

`Sidebar.astro` computes one `i18n` object per locale at build time — through the real `localizedPath`, `siteConfig.nav`, and the `t()` copy table — and passes it to the inline script via `define:vars`. Nav links carry `data-nav-key`; `BaseLayout` stamps `data-locale` on `<html>`. After a swap the script reads the current locale from `data-locale` and copies serialized values onto the persisted DOM. It derives nothing.

## Rationale

- **Locality**: the prefix rule, nav order, and copy each live in exactly one module again; the client script is a dumb attribute swap.
- A URL-scheme or copy change cannot drift between server render and client swap — both read the same source.

## Consequences

- The script still owns generic behavior (active-link highlighting, theme toggle, `preferred-locale` storage) — the stored locale now comes from a serialized `data-locale-target`, not URL parsing.
- The skip-link is outside the persisted regions and re-renders with each page, so the script no longer touches it.
