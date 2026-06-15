import type { Root } from 'mdast';
import remarkLinkCard, {
  isUnsafePlaintextSnippet,
  pickDescription,
  createLinkCard,
  type LinkCardData,
} from '../src/plugins/remark-link-card.ts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return (async () => {
    try {
      await fn();
      passed++;
      console.log(`  PASS  ${name}`);
    } catch (e) {
      failed++;
      console.error(`  FAIL  ${name}`);
      console.error(`        ${e}`);
    }
  })();
}

// ── isUnsafePlaintextSnippet ──────────────────────────────────────────────────

await test('isUnsafePlaintextSnippet: empty string is unsafe', () => {
  assert(isUnsafePlaintextSnippet('') === true, 'empty should be unsafe');
  assert(isUnsafePlaintextSnippet('   ') === true, 'whitespace-only should be unsafe');
});

await test('isUnsafePlaintextSnippet: markup strings are unsafe', () => {
  assert(isUnsafePlaintextSnippet('<div>foo</div>') === true, 'HTML tag should be unsafe');
  assert(
    isUnsafePlaintextSnippet('<meta name="description" content="x">') === true,
    'meta tag should be unsafe',
  );
  assert(isUnsafePlaintextSnippet('  <br>') === true, 'leading tag should be unsafe');
  assert(isUnsafePlaintextSnippet('<META>') === true, 'uppercase META should be unsafe');
});

await test('isUnsafePlaintextSnippet: plain text is safe', () => {
  assert(isUnsafePlaintextSnippet('Hello world') === false, 'plain text should be safe');
  assert(
    isUnsafePlaintextSnippet('A description with numbers 123') === false,
    'alphanumeric should be safe',
  );
  assert(
    isUnsafePlaintextSnippet('contains > and < in context') === false,
    'angle brackets mid-string should be safe',
  );
});

// ── pickDescription ───────────────────────────────────────────────────────────

await test('pickDescription: returns empty for undefined', () => {
  assert(pickDescription(undefined) === '', 'undefined should return empty');
});

await test('pickDescription: returns empty for empty object', () => {
  assert(pickDescription({}) === '', 'empty object should return empty');
});

await test('pickDescription: prefers ogDescription over twitterDescription', () => {
  const result = pickDescription({ ogDescription: 'OG desc', twitterDescription: 'Twitter desc' });
  assert(result === 'OG desc', `expected "OG desc", got "${result}"`);
});

await test('pickDescription: falls back to twitterDescription', () => {
  const result = pickDescription({ twitterDescription: 'Twitter desc' });
  assert(result === 'Twitter desc', `expected "Twitter desc", got "${result}"`);
});

await test('pickDescription: skips unsafe values', () => {
  const result = pickDescription({
    ogDescription: '<meta charset="utf-8">',
    twitterDescription: 'Safe description',
  });
  assert(result === 'Safe description', `expected "Safe description", got "${result}"`);
});

await test('pickDescription: encodes HTML entities', () => {
  const result = pickDescription({ ogDescription: 'Tom & Jerry' });
  assert(!result.includes('& ') || result.includes('&#'), `should encode & (got "${result}")`);
  assert(result !== 'Tom & Jerry', 'should have encoded the raw ampersand');
});

await test('pickDescription: skips non-string values', () => {
  const result = pickDescription({ ogDescription: 42, twitterDescription: true });
  assert(result === '', `expected empty, got "${result}"`);
});

// ── createLinkCard ────────────────────────────────────────────────────────────

const sampleData: LinkCardData = {
  title: 'Test Title',
  description: 'A test description',
  faviconSrc: 'https://example.com/favicon.ico',
  ogImageSrc: 'https://example.com/og.png',
  ogImageAlt: 'OG image',
  displayUrl: 'example.com',
  url: 'https://example.com',
};

await test('createLinkCard: contains expected CSS classes', () => {
  const html = createLinkCard(sampleData);
  assert(html.includes('rlc-container'), 'should have rlc-container');
  assert(html.includes('rlc-title'), 'should have rlc-title');
  assert(html.includes('rlc-description'), 'should have rlc-description');
  assert(html.includes('rlc-favicon'), 'should have rlc-favicon');
  assert(html.includes('rlc-url'), 'should have rlc-url');
  assert(html.includes('rlc-image'), 'should have rlc-image');
});

await test('createLinkCard: contains data values', () => {
  const html = createLinkCard(sampleData);
  assert(html.includes('Test Title'), 'should contain title');
  assert(html.includes('A test description'), 'should contain description');
  assert(html.includes('https://example.com'), 'should contain url');
  assert(html.includes('example.com'), 'should contain displayUrl');
  assert(html.includes('https://example.com/og.png'), 'should contain og image src');
});

await test('createLinkCard: omits description when empty', () => {
  const data = { ...sampleData, description: '' };
  const html = createLinkCard(data);
  assert(!html.includes('rlc-description'), 'should not have rlc-description div');
});

await test('createLinkCard: omits image when ogImageSrc is empty', () => {
  const data = { ...sampleData, ogImageSrc: '' };
  const html = createLinkCard(data);
  assert(!html.includes('rlc-image-container'), 'should not have image container');
});

await test('createLinkCard: omits favicon when faviconSrc is empty', () => {
  const data = { ...sampleData, faviconSrc: '' };
  const html = createLinkCard(data);
  assert(!html.includes('rlc-favicon'), 'should not have favicon img');
});

await test('createLinkCard: links to the target URL', () => {
  const html = createLinkCard(sampleData);
  assert(html.includes('href="https://example.com"'), 'should have href on anchor');
});

// ── Integration: remarkLinkCard with mock fetcher ─────────────────────────────

await test('remarkLinkCard: replaces bare URL paragraph with link card HTML', async () => {
  const tree: Root = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'https://example.com' }],
      },
    ],
  };

  const plugin = remarkLinkCard({
    fetcher: async (url) => ({
      title: 'Example',
      description: 'An example site',
      faviconSrc: 'https://example.com/favicon.ico',
      ogImageSrc: '',
      ogImageAlt: '',
      displayUrl: 'example.com',
      url,
    }),
  });

  const result = await plugin(tree);
  assert(result.children.length === 1, 'should have one child');
  assert(result.children[0].type === 'html', `expected html node, got ${result.children[0].type}`);
  const htmlNode = result.children[0] as { type: 'html'; value: string };
  assert(htmlNode.value.includes('rlc-container'), 'should contain link card markup');
  assert(htmlNode.value.includes('Example'), 'should contain fetched title');
  assert(htmlNode.value.includes('An example site'), 'should contain fetched description');
});

await test('remarkLinkCard: does not touch paragraphs with multiple children', async () => {
  const tree: Root = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'Check ' },
          { type: 'text', value: 'https://example.com' },
        ],
      },
    ],
  };

  let called = false;
  const plugin = remarkLinkCard({
    fetcher: async () => {
      called = true;
      return sampleData;
    },
  });

  const result = await plugin(tree);
  assert(!called, 'fetcher should not be called for multi-child paragraph');
  assert(result.children[0].type === 'paragraph', 'should remain a paragraph');
});

await test('remarkLinkCard: does not touch paragraphs without URLs', async () => {
  const tree: Root = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Just plain text, no links here.' }],
      },
    ],
  };

  let called = false;
  const plugin = remarkLinkCard({
    fetcher: async () => {
      called = true;
      return sampleData;
    },
  });

  const result = await plugin(tree);
  assert(!called, 'fetcher should not be called for non-URL text');
  assert(result.children[0].type === 'paragraph', 'should remain a paragraph');
});

await test('remarkLinkCard: handles fetcher errors gracefully', async () => {
  const tree: Root = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'https://broken.example.com' }],
      },
    ],
  };

  const plugin = remarkLinkCard({
    fetcher: async () => {
      throw new Error('network down');
    },
  });

  // Should not throw — errors are caught internally
  const result = await plugin(tree);
  assert(result.children.length === 1, 'should still have one child');
});

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
