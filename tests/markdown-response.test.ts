import {
  extractMainContent,
  htmlToMarkdown,
  acceptsMarkdown,
  isHtmlResponse,
} from '../src/lib/markdown-response';

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

// ── extractMainContent ────────────────────────────────────────────────────────

await test('extractMainContent: extracts <main id="main"> content', () => {
  const html = '<html><body><nav>nav</nav><main id="main"><h1>Title</h1><p>Body</p></main><footer>foot</footer></body></html>';
  const content = extractMainContent(html);
  assert(content.includes('<h1>Title</h1>'), 'should contain heading');
  assert(content.includes('<p>Body</p>'), 'should contain paragraph');
  assert(!content.includes('nav'), 'should not contain nav');
  assert(!content.includes('footer'), 'should not contain footer');
});

await test('extractMainContent: falls back to <body> when no <main id="main">', () => {
  const html = '<html><body><h1>Title</h1></body></html>';
  const content = extractMainContent(html);
  assert(content.includes('<h1>Title</h1>'), 'should contain body content');
});

await test('extractMainContent: falls back to full html when no <body>', () => {
  const html = '<h1>Title</h1>';
  const content = extractMainContent(html);
  assert(content === html, 'should return full html');
});

await test('extractMainContent: handles attributes on <main>', () => {
  const html = '<main class="content" id="main" role="main"><p>Content</p></main>';
  const content = extractMainContent(html);
  assert(content.includes('<p>Content</p>'), 'should extract content regardless of attribute order');
});

await test('extractMainContent: handles case-insensitive tags', () => {
  const html = '<MAIN ID="main"><p>Content</p></MAIN>';
  const content = extractMainContent(html);
  assert(content.includes('<p>Content</p>'), 'should match case-insensitively');
});

// ── htmlToMarkdown ────────────────────────────────────────────────────────────

await test('htmlToMarkdown: converts basic HTML to Markdown', () => {
  const html = '<main id="main"><h1>Title</h1><p>A paragraph with <strong>bold</strong> text.</p></main>';
  const md = htmlToMarkdown(html);
  assert(md.includes('# Title'), 'should convert h1 to atx heading');
  assert(md.includes('A paragraph'), 'should preserve paragraph text');
  assert(md.includes('**bold**'), 'should convert strong to bold');
});

await test('htmlToMarkdown: removes script, style, nav, footer, noscript', () => {
  const html = '<main id="main"><script>alert(1)</script><style>.x{}</style><p>Content</p></main>';
  const md = htmlToMarkdown(html);
  assert(!md.includes('alert'), 'should remove script content');
  assert(!md.includes('.x{}'), 'should remove style content');
  assert(md.includes('Content'), 'should preserve real content');
});

await test('htmlToMarkdown: converts code blocks to fenced syntax', () => {
  const html = '<main id="main"><pre><code>const x = 1;</code></pre></main>';
  const md = htmlToMarkdown(html);
  assert(md.includes('```'), 'should use fenced code blocks');
  assert(md.includes('const x = 1;'), 'should preserve code content');
});

await test('htmlToMarkdown: converts lists with dash markers', () => {
  const html = '<main id="main"><ul><li>One</li><li>Two</li></ul></main>';
  const md = htmlToMarkdown(html);
  assert(md.includes('-   One'), 'should use dash bullet markers');
  assert(md.includes('-   Two'), 'should use dash bullet markers');
});

await test('htmlToMarkdown: returns original html on turndown failure', () => {
  // Pass a non-string that will cause turndown to throw
  const html = null as unknown as string;
  const result = htmlToMarkdown(html);
  assert(result === html, 'should return original input on failure');
});

await test('htmlToMarkdown: returns original input when turndown throws on valid string', () => {
  // Turndown throws on non-HTML strings that aren't valid DOM-like content.
  // We force a throw by passing an object disguised as a string.
  const fakeHtml = { toString: () => { throw new Error('boom'); } } as unknown as string;
  const result = htmlToMarkdown(fakeHtml);
  assert(result === fakeHtml, 'should return original input when turndown throws');
});

await test('extractMainContent: returns full html when no main and no body tags', () => {
  const html = '<div>Just a div</div>';
  const content = extractMainContent(html);
  assert(content === html, 'should return the full html string unchanged');
});

// ── acceptsMarkdown ───────────────────────────────────────────────────────────

await test('acceptsMarkdown: true when Accept includes text/markdown', () => {
  const req = new Request('https://example.com', {
    headers: { Accept: 'text/markdown' },
  });
  assert(acceptsMarkdown(req) === true, 'should accept text/markdown');
});

await test('acceptsMarkdown: false when Accept is text/html', () => {
  const req = new Request('https://example.com', {
    headers: { Accept: 'text/html' },
  });
  assert(acceptsMarkdown(req) === false, 'should not accept text/html');
});

await test('acceptsMarkdown: false when no Accept header', () => {
  const req = new Request('https://example.com');
  assert(acceptsMarkdown(req) === false, 'should not accept when no Accept header');
});

await test('acceptsMarkdown: true when Accept includes text/markdown among others', () => {
  const req = new Request('https://example.com', {
    headers: { Accept: 'text/html, text/markdown, application/json' },
  });
  assert(acceptsMarkdown(req) === true, 'should accept when text/markdown is in list');
});

// ── isHtmlResponse ────────────────────────────────────────────────────────────

await test('isHtmlResponse: true for text/html content type', () => {
  const res = new Response('<html></html>', {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
  assert(isHtmlResponse(res) === true, 'should detect text/html');
});

await test('isHtmlResponse: false for application/json', () => {
  const res = new Response('{}', {
    headers: { 'Content-Type': 'application/json' },
  });
  assert(isHtmlResponse(res) === false, 'should not detect application/json');
});

await test('isHtmlResponse: false for missing content type', () => {
  const res = new Response('');
  assert(isHtmlResponse(res) === false, 'should not detect when no content type');
});

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
