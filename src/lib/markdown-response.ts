import TurndownService from 'turndown';

// HTML-to-Markdown conversion for the Cloudflare middleware. See ADR-0005.

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  bulletListMarker: '-',
});

turndown.remove(['script', 'style', 'nav', 'footer', 'noscript']);

/** The id BaseLayout puts on `<main>`; the extraction regex below matches on it. */
export const MAIN_CONTENT_ID = 'main';

const mainPattern = new RegExp(`<main[^>]*id="${MAIN_CONTENT_ID}"[^>]*>([\\s\\S]*?)</main>`, 'i');

export function extractMainContent(html: string): string {
  return html.match(mainPattern)?.[1] || html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
}

export function htmlToMarkdown(html: string): string {
  try {
    return turndown.turndown(extractMainContent(html));
  } catch {
    return html;
  }
}

export function acceptsMarkdown(request: Request): boolean {
  return (request.headers.get('Accept') || '').includes('text/markdown');
}

export function isHtmlResponse(response: Response): boolean {
  return (response.headers.get('Content-Type') || '').includes('text/html');
}
