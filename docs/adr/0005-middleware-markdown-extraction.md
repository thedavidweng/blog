# ADR-0005: Extract middleware HTML-to-Markdown to testable module

Date: 2026-07-22

## Context

The Cloudflare middleware (`functions/_middleware.ts`) converts HTML responses to Markdown when the client sends `Accept: text/markdown`. The conversion logic — `extractMainContent` (regex-based HTML extraction), `convertToMarkdown` (turndown), `acceptsMarkdown`, `isHtmlResponse` — was all inline in the middleware file with no tests. The functions were pure but trapped in a Cloudflare-only file.

## Decision

Extract the conversion logic to `src/lib/markdown-response.ts` with a clean interface: `htmlToMarkdown(html: string): string`, `extractMainContent(html: string): string`, `acceptsMarkdown(request: Request): boolean`, `isHtmlResponse(response: Response): boolean`. The middleware becomes a thin adapter that calls these functions.

## Rationale

- **Locality**: The HTML-to-Markdown logic and its tests live in one module. Bugs are found locally, not by deploying and sending a request.
- **Testability**: The conversion functions are pure — they just needed a seam. Moving them to `src/lib/` makes them importable by tests.
- **Leverage**: The middleware shrinks to a routing concern; the conversion logic is reusable and verifiable.

## Consequences

- The middleware imports from `src/lib/`, which works because Cloudflare Pages bundles the functions with the project.
- 17 tests cover content extraction, Markdown conversion, header checks, and error handling.
