import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absoluteUrl } from '../site.config';

/**
 * LLMs.txt route — dynamically generated site overview for AI systems.
 * Provides up-to-date stats and links so content never goes stale.
 * Reference: https://tw93.fun/2026-05-01/ai-visibility.html
 */
export const GET: APIRoute = async () => {
  const allPosts = await getCollection('posts');
  const published = allPosts
    .filter((post) => !post.data.draft)
    .sort(
      (a, b) =>
        new Date(b.data.publishedDate).getTime() -
        new Date(a.data.publishedDate).getTime()
    );

  const totalPosts = published.length;

  const recentPosts = published
    .slice(0, 8)
    .map((post) => {
      const locale = post.data.locale === 'zh' ? 'zh' : 'en';
      const slug = post.id.replace(/^(en|zh)\//, '');
      const path = locale === 'zh' ? `/zh/posts/${slug}/` : `/posts/${slug}/`;
      const url = absoluteUrl(path);
      const desc = post.data.description
        ? ` — ${post.data.description.slice(0, 120)}${post.data.description.length > 120 ? '...' : ''}`
        : '';
      return `- **[${post.data.title}](${url})** (${locale === 'en' ? 'en' : 'zh'})${desc}`;
    })
    .join('\n');

  const text = [
    '# David Blog',
    '',
    '> A personal blog by David Weng (@thedavidweng), exploring design, code, tools, finance, animation, and bilingual writing.',
    '',
    '## About',
    '',
    'Developer and analyst based in Vancouver, Canada.',
    'The blog covers three areas: thinking behind projects and works, observations on design / media / AI / internet, and notes on workflows / tools / explorations.',
    '',
    '## Links',
    '',
    `- [Posts](${absoluteUrl('/posts/')})`,
    `- [Tags](${absoluteUrl('/tags/')})`,
    `- [About](${absoluteUrl('/about/')})`,
    `- [Referral Codes](${absoluteUrl('/my-referral-codes/')})`,
    `- [GitHub](https://github.com/thedavidweng)`,
    `- [X / Twitter](https://x.com/thedavidweng)`,
    `- [LinkedIn](https://www.linkedin.com/in/thedavidweng/)`,
    `- [Portfolio](https://davidweng.eu.org/)`,
    '',
    '## Projects',
    '',
    '**OpenLoop** — AI music generation tool (React + Rust/Tauri).',
    '**OpenKara** — Desktop karaoke with AI lyrics and pitch tracking.',
    '**Deck-Work** — Productivity tool for work sessions.',
    '',
    `## Recent Posts (${totalPosts} total)`,
    '',
    recentPosts || 'No published posts yet.',
    '',
    '## Machine-Readable Endpoints',
    '',
    `- ${absoluteUrl('/sitemap-index.xml')} — All pages`,
    `- ${absoluteUrl('/llms-full.txt')} — Complete blog knowledge base`,
    `- ${absoluteUrl('/rss.xml')} — RSS feed (English)`,
    `- ${absoluteUrl('/zh/rss.xml')} — RSS feed (Chinese)`,
    ''
  ].join('\n');

  return new Response(text, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8'
    }
  });
};
