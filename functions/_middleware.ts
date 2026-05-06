import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  bulletListMarker: '-'
});

turndown.remove(['script', 'style', 'nav', 'footer', 'noscript']);

function extractMainContent(html: string): string {
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

function convertToMarkdown(html: string): string {
  const content = extractMainContent(html);
  try {
    return turndown.turndown(content);
  } catch {
    return html;
  }
}

function acceptsMarkdown(request: Request): boolean {
  const accept = request.headers.get('Accept') || '';
  return accept.includes('text/markdown');
}

function isHtmlResponse(response: Response): boolean {
  const contentType = response.headers.get('Content-Type') || '';
  return contentType.includes('text/html');
}

export async function onRequest(context: { request: Request; next: () => Promise<Response> }): Promise<Response> {
  const response = await context.next();

  const headers = new Headers(response.headers);
  headers.set('Vary', 'Accept');

  if (!acceptsMarkdown(context.request) || !isHtmlResponse(response)) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  const html = await response.text();
  const markdown = convertToMarkdown(html);

  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  headers.delete('Content-Length');
  headers.set('x-markdown-origin', 'html-to-markdown');

  return new Response(markdown, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
