# AGENTS.md

Astro static blog on Cloudflare Workers Static Assets. Source: https://github.com/thedavidweng/blog

## Images

All article images go in `public/posts/<slug>/` as **AVIF** files.

**Why `public/` not `src/`**: Images are manually pre-optimized AVIF. Astro's build pipeline would re-encode them (WebP q80), which is a net loss. `public/` copies as-is. Full rationale in `docs/image-workflow.md`.

## Post Conventions

- Every post has both `en` and `zh` versions; slugs must match.
- **YAML boolean pitfall**: Only `true`/`false`/`True`/`False`/`TRUE`/`FALSE` are booleans. `no`/`yes`/`on`/`off` are strings — `z.boolean()` will reject them. Write `draft: false`, not `draft: no`.
- Giscus maps comment threads by post `slug`, so the `en` and `zh` versions of a post share one thread. Don't switch the mapping.

## Writing Style

Follow `docs/writing-style-guide.md`.

## OG Images

Generated at build time by `astro-og-canvas` → `dist/og/`, **not** committed to `public/og/`. The directory is empty by design.

## Code Comments & Line Economy

- **No comments unless the code cannot express the fact itself.** Rename, extract, or restructure before adding a comment. A comment that restates the code is a defect.
- **A comment is only justified for a constraint the code cannot carry**: an external gotcha, a non-obvious workaround, or a "why not the obvious thing" that would otherwise be re-broken. It states *why*, never *what*.
- **Where rationale goes instead of a comment:**
  - An architectural/design decision → a new `docs/adr/000N-*.md`.
  - A repo-wide convention or pitfall → this `AGENTS.md`.
  - Only a locally-scoped, code-adjacent caveat → a `//` comment on its own line.
- **No `TODO`/`FIXME`/`HACK`/`XXX`** in committed code (lint-enforced). Open an issue instead.
- **No trailing inline comments** (lint-enforced); put the note on its own line above.
- **JSDoc: none by default.** Types are the contract. Add JSDoc only where types cannot convey the contract (units, invariants, or output examples like the URL builders in `src/lib/locale.ts`).
- **Exception**: an intentionally empty `catch {}` must contain a comment (oxlint `no-empty` treats a comment-only block as non-empty) — make it state the *why* of the no-op, e.g. `/* fail open: stay on current page */`.
- **Line economy**: prefer the smallest readable form. Delete dead paths, collapse duplication (see ADR-0002/0003), avoid ceremony — but never code-golf into obscurity. CI enforces a per-file comment budget via `scripts/check-comment-budget.sh`.
