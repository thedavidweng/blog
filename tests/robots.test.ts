import { botPolicy, GET, renderRobotsTxt } from '../src/pages/robots.txt.ts';
import { assert, test } from './harness';

const text = renderRobotsTxt();

const botBlock = (agent: string) => {
  const match = text.match(
    new RegExp(`User-agent: ${agent}\\nContent-Signal: ([^\\n]+)\\n(Allow|Disallow): /\\n`),
  );
  assert(match, `robots.txt must declare a complete block for ${agent}`);
  return { signal: match[1], rule: match[2] };
};

test('robots.txt: no bot may train, and crawl access follows the search signal', () => {
  for (const { signal, agents } of botPolicy) {
    assert(signal.includes('ai-train=no'), 'training is opted out for every bot');
    for (const agent of agents) {
      const { rule } = botBlock(agent);
      const expectedRule = signal.includes('search=yes') ? 'Allow' : 'Disallow';
      assert(rule === expectedRule, `${agent}: expected ${expectedRule}, got ${rule}`);
    }
  }
});

test('robots.txt: each agent appears exactly once and the sitemap is linked', () => {
  for (const { agents } of botPolicy) {
    for (const agent of agents) {
      const count = text.split(`User-agent: ${agent}\n`).length - 1;
      assert(count === 1, `${agent} should appear once, found ${count}`);
    }
  }
  assert(/Sitemap: .+\/sitemap-index\.xml/.test(text), 'sitemap must be linked');
});

test('robots.txt: the route serves the rendered policy as plain text', async () => {
  const response = await GET({} as any);
  assert(
    response.headers.get('Content-Type') === 'text/plain; charset=utf-8',
    'must serve plain text',
  );
  assert((await response.text()) === text, 'route body must be the rendered policy');
});
