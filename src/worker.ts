import { acceptsMarkdown, htmlToMarkdown, isHtmlResponse } from './lib/markdown-response';

type Env = { ASSETS: { fetch(request: Request): Promise<Response> } };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set('Vary', 'Accept');

    if (!acceptsMarkdown(request) || !isHtmlResponse(response)) {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    const markdown = htmlToMarkdown(await response.text());
    headers.set('Content-Type', 'text/markdown; charset=utf-8');
    headers.delete('Content-Length');
    headers.set('x-markdown-origin', 'html-to-markdown');

    return new Response(markdown, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
