import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * LLMs.txt route - provides a site overview for AI systems.
 * Reference: https://tw93.fun/2026-05-01/ai-visibility.html
 *
 * Note: The comprehensive static version is at public/llms.txt.
 * This route is kept for compatibility but the static file is preferred.
 */
export const GET: APIRoute = async () => {
  const allPosts = await getCollection('posts');
  const published = allPosts.filter((post) => !post.data.draft);

  // Get unique slugs
  const slugs = new Set(published.map((p) => p.id.replace(/^(en|zh)\//, '')));

  const lines = [
    '# David Blog',
    '',
    'Site overview for AI systems. See /llms.txt for the full description.',
    '',
    `Total posts: ${published.length}`,
    `Post slugs: ${[...slugs].join(', ')}`
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
};
