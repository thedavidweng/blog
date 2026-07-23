import type { OgObject } from 'open-graph-scraper/types';
import { markdownToHtml } from 'satteri';
import {
  isUnsafePlaintextSnippet,
  pickDescription,
  createLinkCard,
  createDefaultFetcher,
  extractUrlFromParagraph,
  getOpenGraph,
  linkCardPlugin,
  type LinkCardData,
} from '../src/plugins/link-card.ts';

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
  // Meta tag not at the start (passes the leading-< check, caught by the meta check)
  assert(isUnsafePlaintextSnippet('text <meta charset="utf-8">') === true, 'embedded meta should be unsafe');
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
  assert(pickDescription({} as OgObject) === '', 'empty object should return empty');
});

await test('pickDescription: prefers ogDescription over twitterDescription', () => {
  const result = pickDescription({
    ogDescription: 'OG desc',
    twitterDescription: 'Twitter desc',
  } as OgObject);
  assert(result === 'OG desc', `expected "OG desc", got "${result}"`);
});

await test('pickDescription: falls back to twitterDescription', () => {
  const result = pickDescription({ twitterDescription: 'Twitter desc' } as OgObject);
  assert(result === 'Twitter desc', `expected "Twitter desc", got "${result}"`);
});

await test('pickDescription: skips unsafe values', () => {
  const result = pickDescription({
    ogDescription: '<meta charset="utf-8">',
    twitterDescription: 'Safe description',
  } as OgObject);
  assert(result === 'Safe description', `expected "Safe description", got "${result}"`);
});

await test('pickDescription: encodes HTML entities', () => {
  const result = pickDescription({ ogDescription: 'Tom & Jerry' } as OgObject);
  assert(!result.includes('& ') || result.includes('&#'), `should encode & (got "${result}")`);
  assert(result !== 'Tom & Jerry', 'should have encoded the raw ampersand');
});

await test('pickDescription: skips non-string values', () => {
  const result = pickDescription({
    ogDescription: 42,
    twitterDescription: true,
  } as unknown as OgObject);
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
  assert(html.includes('href="https://example.com"'), 'should contain url in href');
  assert(html.includes('rlc-url">example.com</span>'), 'should contain displayUrl in span');
  assert(html.includes('src="https://example.com/og.png"'), 'should contain og image src');
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

// ── Integration: linkCardPlugin via markdownToHtml ────────────────────────────

const mockFetcher = async (url: string): Promise<LinkCardData> => ({
  title: 'Example',
  description: 'An example site',
  faviconSrc: 'https://example.com/favicon.ico',
  ogImageSrc: '',
  ogImageAlt: '',
  displayUrl: 'example.com',
  url,
});

await test('linkCardPlugin: replaces bare URL paragraph with link card HTML', async () => {
  const { html } = await markdownToHtml('https://example.com', {
    mdastPlugins: [() => linkCardPlugin({ fetcher: mockFetcher })],
  });
  assert(html.includes('rlc-container'), 'should contain link card markup');
  assert(html.includes('Example'), 'should contain fetched title');
  assert(html.includes('An example site'), 'should contain fetched description');
});

await test('linkCardPlugin: does not touch paragraphs with multiple children', async () => {
  let called = false;
  const { html } = await markdownToHtml('Check https://example.com', {
    mdastPlugins: [
      () =>
        linkCardPlugin({
          fetcher: async () => {
            called = true;
            return sampleData;
          },
        }),
    ],
  });
  assert(!called, 'fetcher should not be called for multi-child paragraph');
  assert(html.includes('Check'), 'should contain the text "Check"');
  assert(!html.includes('rlc-container'), 'should not contain link card');
});

await test('linkCardPlugin: does not touch paragraphs without URLs', async () => {
  let called = false;
  const { html } = await markdownToHtml('Just plain text, no links here.', {
    mdastPlugins: [
      () =>
        linkCardPlugin({
          fetcher: async () => {
            called = true;
            return sampleData;
          },
        }),
    ],
  });
  assert(!called, 'fetcher should not be called for non-URL text');
  assert(html.includes('plain text'), 'should contain the plain text');
  assert(!html.includes('rlc-container'), 'should not contain link card');
});

await test('linkCardPlugin: handles fetcher errors gracefully', async () => {
  const { html } = await markdownToHtml('https://broken.example.com', {
    mdastPlugins: [
      () =>
        linkCardPlugin({
          fetcher: async () => {
            throw new Error('network down');
          },
        }),
    ],
  });
  // Should not throw — the URL remains as text
  assert(html.includes('>https://broken.example.com<'), 'URL should remain as text');
});

await test('linkCardPlugin: one failed fetch does not suppress other link cards', async () => {
  const source = `https://good.example.com

https://broken.example.com

https://also-good.example.com`;

  const { html } = await markdownToHtml(source, {
    mdastPlugins: [
      () =>
        linkCardPlugin({
          fetcher: async (url) => {
            if (url.includes('broken')) throw new Error('network down');
            return {
              title: `Card for ${url}`,
              description: '',
              faviconSrc: '',
              ogImageSrc: '',
              ogImageAlt: '',
              displayUrl: url,
              url,
            };
          },
        }),
    ],
  });

  assert(html.includes('>Card for https://good.example.com<'), 'first card should be rendered');
  assert(html.includes('>https://broken.example.com<'), 'broken URL should remain as text');
  assert(
    html.includes('>Card for https://also-good.example.com<'),
    'third card should be rendered',
  );
});

// ── createDefaultFetcher ──────────────────────────────────────────────────────

const TEST_HOST = 'example.com';

await test('createDefaultFetcher: returns hostname as title when OG title is missing', async () => {
  const fetcher = createDefaultFetcher();
  const testUrl = `https://${TEST_HOST}`;
  const data = await fetcher(testUrl);
  assert(data.title === TEST_HOST, `expected hostname as title, got "${data.title}"`);
  assert(data.url === testUrl, 'url should match input');
  assert(data.faviconSrc === `https://www.google.com/s2/favicons?domain=${TEST_HOST}`, `expected google favicon URL, got "${data.faviconSrc}"`);
});

await test('createDefaultFetcher: shortenUrl option returns hostname as displayUrl', async () => {
  const fetcher = createDefaultFetcher({ shortenUrl: true });
  const data = await fetcher(`https://${TEST_HOST}/some/path`);
  assert(data.displayUrl === TEST_HOST, `expected hostname, got "${data.displayUrl}"`);
});

await test('createDefaultFetcher: full URL as displayUrl without shortenUrl', async () => {
  const fetcher = createDefaultFetcher();
  const testUrl = `https://${TEST_HOST}/some/path`;
  const data = await fetcher(testUrl);
  assert(data.displayUrl === testUrl, `expected full URL, got "${data.displayUrl}"`);
});

await test('createDefaultFetcher: handles undecodable URL displayUrl gracefully', async () => {
  const fetcher = createDefaultFetcher();
  const testUrl = `https://${TEST_HOST}/%E0%A4%A`;
  const data = await fetcher(testUrl);
  assert(data.url === testUrl, 'url should match input');
  assert(typeof data.displayUrl === 'string', 'displayUrl should be a string');
});

await test('createDefaultFetcher: extracts OG image URL and alt when present', async () => {
  const fetcher = createDefaultFetcher({
    ogFetcher: async () =>
      ({
        ogTitle: 'Test Site',
        ogImage: [{ url: 'https://example.com/og.png', alt: 'Test OG image' }],
      }) as any,
  });
  const data = await fetcher(`https://${TEST_HOST}`);
  assert(data.ogImageSrc === 'https://example.com/og.png', `expected og image URL, got "${data.ogImageSrc}"`);
  assert(data.ogImageAlt === 'Test OG image', `expected escaped alt, got "${data.ogImageAlt}"`);
  assert(data.title === 'Test Site', `expected OG title, got "${data.title}"`);
});

await test('createDefaultFetcher: falls back to title when OG image alt is missing', async () => {
  const fetcher = createDefaultFetcher({
    ogFetcher: async () =>
      ({
        ogTitle: 'Test Site',
        ogImage: [{ url: 'https://example.com/og.png' }],
      }) as any,
  });
  const data = await fetcher(`https://${TEST_HOST}`);
  assert(data.ogImageSrc === 'https://example.com/og.png', 'should have og image URL');
  assert(data.ogImageAlt === 'Test Site', `expected title as alt fallback, got "${data.ogImageAlt}"`);
});

await test('createDefaultFetcher: escapes HTML in OG image alt', async () => {
  const fetcher = createDefaultFetcher({
    ogFetcher: async () =>
      ({
        ogTitle: 'Test Site',
        ogImage: [{ url: 'https://example.com/og.png', alt: 'Tom & Jerry' }],
      }) as any,
  });
  const data = await fetcher(`https://${TEST_HOST}`);
  assert(data.ogImageAlt.includes('&amp;'), `expected escaped ampersand, got "${data.ogImageAlt}"`);
});

await test('createDefaultFetcher: escapes HTML in OG title', async () => {
  const fetcher = createDefaultFetcher({
    ogFetcher: async () =>
      ({
        ogTitle: 'Tom & Jerry',
      }) as any,
  });
  const data = await fetcher(`https://${TEST_HOST}`);
  assert(data.title.includes('&amp;'), `expected escaped ampersand, got "${data.title}"`);
});

await test('createDefaultFetcher: returns empty ogImageSrc when OG result has no image', async () => {
  const fetcher = createDefaultFetcher({
    ogFetcher: async () => ({ ogTitle: 'Test Site' }) as any,
  });
  const data = await fetcher(`https://${TEST_HOST}`);
  assert(data.ogImageSrc === '', `expected empty ogImageSrc, got "${data.ogImageSrc}"`);
  assert(data.ogImageAlt === 'Test Site', `expected title as alt, got "${data.ogImageAlt}"`);
});

await test('createDefaultFetcher: handles getOpenGraph returning undefined', async () => {
  const fetcher = createDefaultFetcher({
    ogFetcher: async () => undefined,
  });
  const data = await fetcher(`https://${TEST_HOST}`);
  assert(data.title === TEST_HOST, `expected hostname as title, got "${data.title}"`);
  assert(data.ogImageSrc === '', 'expected empty ogImageSrc');
  assert(data.ogImageAlt === TEST_HOST, `expected hostname as alt, got "${data.ogImageAlt}"`);
  assert(data.description === '', 'expected empty description');
});

// ── getOpenGraph ──────────────────────────────────────────────────────────────

await test('getOpenGraph: returns undefined for unreachable URL', async () => {
  const result = await getOpenGraph('https://nonexistent.invalid.example');
  assert(result === undefined, 'should return undefined for unreachable URL');
});

// ── linkCardPlugin edge cases ─────────────────────────────────────────────────

await test('linkCardPlugin: processes normal paragraph (no data property)', async () => {
  const { html } = await markdownToHtml('https://example.com', {
    mdastPlugins: [
      () =>
        linkCardPlugin({
          fetcher: async (url) => ({
            title: 'Example',
            description: '',
            faviconSrc: '',
            ogImageSrc: '',
            ogImageAlt: '',
            displayUrl: 'example.com',
            url,
          }),
        }),
    ],
  });
  assert(html.includes('rlc-container'), 'should process paragraph without data property');
});

await test('linkCardPlugin: does not process text with multiple URLs', async () => {
  let called = false;
  const { html } = await markdownToHtml('https://a.com https://b.com', {
    mdastPlugins: [
      () =>
        linkCardPlugin({
          fetcher: async () => {
            called = true;
            return sampleData;
          },
        }),
    ],
  });
  assert(!called, 'fetcher should not be called for multiple URLs');
  assert(!html.includes('rlc-container'), 'should not contain link card');
});

await test('linkCardPlugin: uses provided fetcher option directly', async () => {
  const { html } = await markdownToHtml('https://example.com', {
    mdastPlugins: [
      () =>
        linkCardPlugin({
          fetcher: async (url) => ({
            title: 'Direct Fetcher',
            description: '',
            faviconSrc: '',
            ogImageSrc: '',
            ogImageAlt: '',
            displayUrl: 'example.com',
            url,
          }),
        }),
    ],
  });
  assert(html.includes('Direct Fetcher'), 'should use provided fetcher');
});

await test('linkCardPlugin: falls back to createDefaultFetcher when no fetcher given', async () => {
  const { html } = await markdownToHtml('https://example.com', {
    mdastPlugins: [
      () =>
        linkCardPlugin({
          ogFetcher: async () =>
            ({ ogTitle: 'Default Fetcher Title' }) as any,
        }),
    ],
  });
  assert(html.includes('Default Fetcher Title'), 'should use default fetcher with ogFetcher');
});

// ── extractUrlFromParagraph ───────────────────────────────────────────────────

await test('extractUrlFromParagraph: returns undefined for paragraph with data property', () => {
  const result = extractUrlFromParagraph({
    data: { someData: true },
    children: [{ type: 'text', value: 'https://example.com' }],
  });
  assert(result === undefined, 'should return undefined when data is present');
});

await test('extractUrlFromParagraph: returns undefined for empty children', () => {
  const result = extractUrlFromParagraph({ children: [] });
  assert(result === undefined, 'should return undefined for no children');
});

await test('extractUrlFromParagraph: returns undefined when single child is falsy', () => {
  const result = extractUrlFromParagraph({ children: [undefined] });
  assert(result === undefined, 'should return undefined for falsy child');
});

await test('extractUrlFromParagraph: returns undefined for text with multiple URLs', () => {
  const result = extractUrlFromParagraph({
    children: [{ type: 'text', value: 'https://a.com https://b.com' }],
  });
  assert(result === undefined, 'should return undefined for multiple URLs');
});

await test('extractUrlFromParagraph: returns URL for bare text with single URL', () => {
  const result = extractUrlFromParagraph({
    children: [{ type: 'text', value: 'https://example.com' }],
  });
  assert(result === 'https://example.com', `expected URL, got "${result}"`);
});

await test('extractUrlFromParagraph: returns URL for GFM autolinked link node', () => {
  const result = extractUrlFromParagraph({
    children: [
      {
        type: 'link',
        url: 'https://example.com',
        children: [{ type: 'text', value: 'https://example.com' }],
      },
    ],
  });
  assert(result === 'https://example.com', `expected URL from link node, got "${result}"`);
});

await test('extractUrlFromParagraph: returns undefined for link with mismatched URL and text', () => {
  const result = extractUrlFromParagraph({
    children: [
      {
        type: 'link',
        url: 'https://example.com',
        children: [{ type: 'text', value: 'click here' }],
      },
    ],
  });
  assert(result === undefined, 'should return undefined for non-autolink link');
});

await test('extractUrlFromParagraph: returns undefined for non-text, non-link child', () => {
  const result = extractUrlFromParagraph({
    children: [{ type: 'image', url: 'https://example.com/img.png' }],
  });
  assert(result === undefined, 'should return undefined for image child');
});

await test('extractUrlFromParagraph: returns undefined for multiple children', () => {
  const result = extractUrlFromParagraph({
    children: [
      { type: 'text', value: 'Check ' },
      { type: 'text', value: 'https://example.com' },
    ],
  });
  assert(result === undefined, 'should return undefined for multiple children');
});

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
