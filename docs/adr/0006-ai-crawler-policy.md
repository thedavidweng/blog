# ADR-0006: AI crawler policy (GEO)

Date: 2026-07-24

## Context

Generative engines (ChatGPT, Claude, Perplexity) increasingly mediate how readers find content. The site must decide, bot by bot, whether its content may be used for model training, AI search, and real-time AI input — and expose a machine-readable site overview for AI systems.

## Decision

`src/pages/robots.txt.ts` declares a per-bot policy using [Content-Signal](https://contentsignals.org/):

- **Training: no** for every bot (`ai-train=no`).
- **AI search: yes** — search/retrieval bots (OAI-SearchBot, Claude-SearchBot, PerplexityBot, GPTBot, ClaudeBot, Google-Extended, Googlebot, Bingbot) are allowed, for visibility in AI search results.
- **Real-time input: yes only for user-triggered fetches** (ChatGPT-User, Claude-User) — "summarize this page" requests act on behalf of a human reader.
- **Blocked**: CCBot, Meta-ExternalAgent, Applebot-Extended, Bytespider — crawlers that train without a search-visibility benefit or don't declare intent.

`src/pages/llms.txt.ts` serves a dynamically generated `llms.txt`: post counts and recent-post links are built from the content collection at build time, so the overview never goes stale.

## Rationale

Follows the GEO (Generative Engine Optimization) practices described in <https://tw93.fun/2026-05-01/ai-visibility.html>: maximize AI-search visibility while opting out of training.

## Consequences

- `robots.txt.ts` stays a hand-written literal (what you see is what ships). Adding a bot means adding one four-line block reusing one of the three existing Content-Signal values.
- Content-Signal is advisory; compliance depends on the crawler.
