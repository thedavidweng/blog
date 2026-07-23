import TurndownService from 'turndown';

/**
 * HTML-to-Markdown conversion for the Cloudflare middleware.
 * See ADR-0005 for the decision record.
 */

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  bulletListMarker: '-',
});

turndown.remove(['script', 'style', 'nav', 'footer', 'noscript']);

/** Extract the `<main id="main">` content, falling back to `<body>` then the full HTML. */
export function extractMainContent(html: string): string {
  const match = html.match(/<main[^>]*id="main"[^>]*>([\s\S]*?)<\/main>/i);
  if (match && match[1]) {
    return match[1];
  }
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    return bodyMatch[1];
  }
  return html;
}

/** Convert an HTML string to Markdown, extracting main content first. */
export function htmlToMarkdown(html: string): string {
  try {
    const content = extractMainContent(html);
    return turndown.turndown(content);
  } catch {
    return html;
  }
}

/** Check if a request accepts Markdown (via Accept header). */
export function acceptsMarkdown(request: Request): boolean {
  const accept = request.headers.get('Accept') || '';
  return accept.includes('text/markdown');
}

/** Check if a response is HTML (via Content-Type header). */
export function isHtmlResponse(response: Response): boolean {
  const contentType = response.headers.get('Content-Type') || '';
  return contentType.includes('text/html');
}
