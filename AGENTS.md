# AGENTS.md

Astro static blog on Cloudflare Pages. Source: https://github.com/thedavidweng/blog

## Images

All article images go in `public/posts/<slug>/` as **AVIF** files.

**Why `public/` not `src/`**: Images are manually pre-optimized AVIF. Astro's build pipeline would re-encode them (WebP q80), which is a net loss. `public/` copies as-is. Full rationale in `docs/image-workflow.md`.

## Post Conventions

- Every post has both `en` and `zh` versions; slugs must match.
- **YAML boolean pitfall**: Only `true`/`false`/`True`/`False`/`TRUE`/`FALSE` are booleans. `no`/`yes`/`on`/`off` are strings — `z.boolean()` will reject them. Write `draft: false`, not `draft: no`.

## Writing Style

Follow `docs/writing-style-guide.md`.

## OG Images

Generated at build time by `astro-og-canvas` → `dist/og/`, **not** committed to `public/og/`. The directory is empty by design.

## Agent skills

### Issue tracker

GitHub Issues — use `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` at root, ADRs in `docs/adr/`. See `docs/agents/domain.md`.
