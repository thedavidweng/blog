import {
  BLOCKED,
  botPolicy,
  renderRobotsTxt,
  SEARCH_BOT,
  USER_FETCHER,
} from '../src/pages/robots.txt.ts';
import { assert, summarize, test } from './harness';

const text = renderRobotsTxt();

const botBlock = (agent: string) => {
  const match = text.match(
    new RegExp(`User-agent: ${agent}\\nContent-Signal: ([^\\n]+)\\n(Allow|Disallow): /\\n`),
  );
  assert(match, `robots.txt must declare a complete block for ${agent}`);
  return { signal: match[1], rule: match[2] };
};

await test('robots.txt: ADR-0006 policy per bot', () => {
  const expected: Record<string, string> = {
    'OAI-SearchBot': SEARCH_BOT,
    'Claude-SearchBot': SEARCH_BOT,
    PerplexityBot: SEARCH_BOT,
    GPTBot: SEARCH_BOT,
    ClaudeBot: SEARCH_BOT,
    'Google-Extended': SEARCH_BOT,
    Googlebot: SEARCH_BOT,
    Bingbot: SEARCH_BOT,
    'ChatGPT-User': USER_FETCHER,
    'Claude-User': USER_FETCHER,
    CCBot: BLOCKED,
    'Meta-ExternalAgent': BLOCKED,
    'Applebot-Extended': BLOCKED,
    Bytespider: BLOCKED,
  };
  for (const [agent, signal] of Object.entries(expected)) {
    const block = botBlock(agent);
    assert(block.signal === signal, `${agent}: expected "${signal}", got "${block.signal}"`);
  }
});

await test('robots.txt: no bot may train, and crawl access follows the search signal', () => {
  for (const { signal, agents } of botPolicy) {
    assert(signal.includes('ai-train=no'), 'training is opted out for every bot');
    for (const agent of agents) {
      const { rule } = botBlock(agent);
      const expectedRule = signal.includes('search=yes') ? 'Allow' : 'Disallow';
      assert(rule === expectedRule, `${agent}: expected ${expectedRule}, got ${rule}`);
    }
  }
});

await test('robots.txt: each agent appears exactly once and the sitemap is linked', () => {
  for (const { agents } of botPolicy) {
    for (const agent of agents) {
      const count = text.split(`User-agent: ${agent}\n`).length - 1;
      assert(count === 1, `${agent} should appear once, found ${count}`);
    }
  }
  assert(/Sitemap: .+\/sitemap-index\.xml/.test(text), 'sitemap must be linked');
});

summarize();
