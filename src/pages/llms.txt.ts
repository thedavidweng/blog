import type { APIRoute } from 'astro';
import { getPostSlug, getPublishedPosts, postUrl } from '../lib/content';
import { absoluteUrl, siteConfig } from '../site.config';

export const GET: APIRoute = async () => {
  const enPosts = await getPublishedPosts('en');
  const zhPosts = await getPublishedPosts('zh');
  const lines = [
    `# ${siteConfig.name}`,
    '',
    siteConfig.description.en,
    '',
    '## English posts',
    ...enPosts.map((post) => {
      return `- [${post.data.title}](${absoluteUrl(postUrl('en', getPostSlug(post)))}): ${post.data.description}`;
    }),
    '',
    '## Chinese posts',
    ...zhPosts.map((post) => {
      return `- [${post.data.title}](${absoluteUrl(postUrl('zh', getPostSlug(post)))}): ${post.data.description}`;
    })
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
};
