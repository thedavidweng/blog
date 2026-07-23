import { acceptsMarkdown, htmlToMarkdown, isHtmlResponse } from '../src/lib/markdown-response';

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
  const markdown = htmlToMarkdown(html);

  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  headers.delete('Content-Length');
  headers.set('x-markdown-origin', 'html-to-markdown');

  return new Response(markdown, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
