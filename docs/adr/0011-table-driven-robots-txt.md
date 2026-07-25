# ADR-0011: Table-driven robots.txt rendering

Date: 2026-07-25

Revises the "stays a hand-written literal" consequence of ADR-0006. The per-bot *policy* decided there is unchanged.

## Context

ADR-0006 chose a hand-written literal for `robots.txt.ts` ("what you see is what ships"). In practice the file repeated the same `Content-Signal` string up to eight times, and the prose section headers had already drifted from the content: Googlebot and Bingbot sat under a "Blocked" banner while being allowed. Cloudflare — the author of the Content Signals Policy — generates these blocks programmatically in its managed robots.txt (3.8M+ domains), rendering directives from per-zone policy settings rather than maintaining literals.

## Decision

`robots.txt.ts` holds a `botPolicy` table — three named `Content-Signal` values, each with the agents it applies to — and one `renderRobotsTxt()` function. The `Allow`/`Disallow` rule is derived from the signal (`search=yes` ⇒ `Allow`), so a bot's crawl access can never contradict its declared signal. `tests/robots.test.ts` locks every agent's signal and rule as a contract.

## Rationale

- **Locality**: adding a bot is one array entry; changing a signal value happens once.
- The comment-banner/content drift class of bug (the Googlebot mislabel) becomes impossible: banners are rendered from the same rows.
- Reviewability moves from "read the literal" to "read the table + the contract test", which is how the policy's own author ships it in production.

## Consequences

- The rendered output regroups bots by policy (search / user-triggered / blocked); per-agent directives are unchanged except the corrected banners.
- Expressing a signal/rule combination outside the derivation (e.g. `search=yes` with `Disallow`) requires revisiting the renderer deliberately.
