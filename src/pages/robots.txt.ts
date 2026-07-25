import type { APIRoute } from 'astro';
import { absoluteUrl } from '../site.config';

// Per-bot policy: see ADR-0006 (signals) and ADR-0011 (table-driven rendering).

export const SEARCH_BOT = 'ai-train=no, search=yes, ai-input=no';
export const USER_FETCHER = 'ai-train=no, search=yes, ai-input=yes';
export const BLOCKED = 'ai-train=no, search=no, ai-input=no';

export const botPolicy = [
  {
    title: 'Search & Retrieval Bots (allow) - These power AI search visibility',
    signal: SEARCH_BOT,
    agents: [
      'OAI-SearchBot',
      'Claude-SearchBot',
      'PerplexityBot',
      'GPTBot',
      'ClaudeBot',
      'Google-Extended',
      'Googlebot',
      'Bingbot',
    ],
  },
  {
    title: 'User-Triggered Bots (allow) - "Summarize this page" requests',
    signal: USER_FETCHER,
    agents: ['ChatGPT-User', 'Claude-User'],
  },
  {
    title: "Blocked Bots - train without search benefit, or don't declare intent",
    signal: BLOCKED,
    agents: ['CCBot', 'Meta-ExternalAgent', 'Applebot-Extended', 'Bytespider'],
  },
] as const;

const banner = (title: string) => [
  '# ============================================',
  `# ${title}`,
  '# ============================================',
  '',
];

export function renderRobotsTxt() {
  return [
    '# David Blog - AI Crawler Configuration',
    '# GEO: Generative Engine Optimization',
    '',
    '# ============================================',
    '# Content Signals - AI content usage preferences',
    '# https://contentsignals.org/',
    '# ============================================',
    '# ai-train=no:  Do not use site content for training models',
    '# search=yes:   Allow content to appear in AI search results',
    '# ai-input=no:  Do not use content as real-time AI input',
    '',
    ...botPolicy.flatMap(({ title, signal, agents }) => [
      ...banner(title),
      ...agents.flatMap((agent) => [
        `User-agent: ${agent}`,
        `Content-Signal: ${signal}`,
        signal.includes('search=yes') ? 'Allow: /' : 'Disallow: /',
        '',
      ]),
    ]),
    ...banner('Sitemap'),
    `Sitemap: ${absoluteUrl('/sitemap-index.xml')}`,
  ].join('\n');
}

export const GET: APIRoute = () =>
  new Response(renderRobotsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
