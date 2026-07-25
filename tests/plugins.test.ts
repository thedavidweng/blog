import { markdownToHtml } from 'satteri';
import { figureCaptionsPlugin } from '../src/plugins/figure-captions';
import { lazyImagesPlugin, type ImageProbe } from '../src/plugins/lazy-images';
import { readingTimePlugin } from '../src/plugins/reading-time';
import { assert, summarize, test } from './harness';

await test('figure-captions: image-only paragraph becomes a figure with caption', async () => {
  const { html } = await markdownToHtml('![A caption](/img.png)', {
    hastPlugins: [figureCaptionsPlugin],
  });
  assert(html.includes('<figure class="post-figure">'), 'should wrap image in figure');
  assert(html.includes('post-figure-caption'), 'should render a figcaption');
  assert(html.includes('>A caption</figcaption>'), 'caption text should come from alt');
  assert(!html.includes('<p>'), 'the paragraph should be replaced');
});

await test('figure-captions: empty alt produces a figure without caption', async () => {
  const { html } = await markdownToHtml('![](/img.png)', {
    hastPlugins: [figureCaptionsPlugin],
  });
  assert(html.includes('<figure class="post-figure">'), 'should wrap image in figure');
  assert(!html.includes('figcaption'), 'should not render an empty figcaption');
});

await test('figure-captions: multi-image paragraph splits into one figure per image', async () => {
  const { html } = await markdownToHtml('![First](/a.png)\n![Second](/b.png)', {
    hastPlugins: [figureCaptionsPlugin],
  });
  const figures = html.match(/<figure/g) ?? [];
  assert(figures.length === 2, `expected 2 figures, got ${figures.length}`);
  assert(html.includes('>First</figcaption>'), 'first caption should render');
  assert(html.includes('>Second</figcaption>'), 'second caption should render');
});

await test('figure-captions: paragraph mixing text and image is left alone', async () => {
  const { html } = await markdownToHtml('Look at ![this](/a.png) now', {
    hastPlugins: [figureCaptionsPlugin],
  });
  assert(!html.includes('<figure'), 'mixed paragraph should not become a figure');
  assert(html.includes('<p>'), 'paragraph should survive');
});

const astroData = () => ({
  astro: {
    frontmatter: {} as Record<string, any>,
    headings: [],
    localImagePaths: new Set<string>(),
    remoteImagePaths: new Set<string>(),
  },
});

const fakeProbe =
  (calls: string[], size?: { width: number; height: number }): ImageProbe =>
  async (src) => {
    calls.push(src);
    return size;
  };

await test('lazy-images: local image gets lazy attrs and probed dimensions', async () => {
  const calls: string[] = [];
  const { html } = await markdownToHtml('![Alt](/img.png)', {
    hastPlugins: [() => lazyImagesPlugin({ probe: fakeProbe(calls, { width: 640, height: 480 }) })],
  });
  assert(html.includes('loading="lazy"'), 'should set loading=lazy');
  assert(html.includes('decoding="async"'), 'should set decoding=async');
  assert(html.includes('width="640"'), 'should set probed width');
  assert(html.includes('height="480"'), 'should set probed height');
  assert(calls.length === 1 && calls[0] === '/img.png', 'probe should be called with the src');
});

await test('lazy-images: external image gets no-referrer and is not probed', async () => {
  const calls: string[] = [];
  const { html } = await markdownToHtml('![Alt](https://cdn.example.com/i.png)', {
    hastPlugins: [() => lazyImagesPlugin({ probe: fakeProbe(calls, { width: 1, height: 1 }) })],
  });
  assert(/referrerpolicy="no-referrer"/i.test(html), 'should set referrerpolicy');
  assert(calls.length === 0, 'probe should not run for external images');
  assert(!html.includes('width="1"'), 'no dimensions for external images');
});

await test('lazy-images: unknown local image ships without dimensions', async () => {
  const { html } = await markdownToHtml('![Alt](/missing.png)', {
    hastPlugins: [() => lazyImagesPlugin({ probe: async () => undefined })],
  });
  assert(html.includes('loading="lazy"'), 'lazy attrs should still apply');
  assert(!html.includes('width='), 'should not invent a width');
});

await test('lazy-images: default probe measures a real public asset', async () => {
  const { html } = await markdownToHtml('![icon](/android-chrome-512x512.png)', {
    hastPlugins: [lazyImagesPlugin],
  });
  assert(html.includes('width="512"'), 'default probe should read the real width');
  assert(html.includes('height="512"'), 'default probe should read the real height');
});

await test('lazy-images: default probe skips files missing from public/', async () => {
  const { html } = await markdownToHtml('![gone](/definitely-not-here.png)', {
    hastPlugins: [lazyImagesPlugin],
  });
  assert(html.includes('loading="lazy"'), 'lazy attrs still apply');
  assert(!html.includes('width='), 'missing files get no dimensions');
});

await test('lazy-images: a throwing probe does not break the pipeline', async () => {
  const { html } = await markdownToHtml('![x](/img.png)', {
    hastPlugins: [
      () =>
        lazyImagesPlugin({
          probe: async () => {
            throw new Error('boom');
          },
        }),
    ],
  });
  assert(html.includes('<img'), 'image should still render');
  assert(!html.includes('width='), 'no dimensions on probe failure');
});

await test('lazy-images + figure-captions: production order composes', async () => {
  const { html } = await markdownToHtml('![A caption](/img.png)', {
    hastPlugins: [
      () => lazyImagesPlugin({ probe: async () => ({ width: 640, height: 480 }) }),
      figureCaptionsPlugin,
    ],
  });
  assert(html.includes('<figure class="post-figure">'), 'figure should render');
  assert(
    html.includes('width="640"') && html.includes('loading="lazy"'),
    'figure img should keep lazy-images properties',
  );
});

await test('reading-time: writes readingTime to the astro frontmatter', async () => {
  const data = astroData();
  await markdownToHtml('Some words to count here.', {
    mdastPlugins: [readingTimePlugin],
    data,
  });
  const rt = data.astro.frontmatter.readingTime;
  assert(rt != null, 'readingTime should be set');
  assert(rt.words === 5, `expected 5 words, got ${rt?.words}`);
});

await test('reading-time: heading-only documents still get a reading time', async () => {
  const data = astroData();
  await markdownToHtml('## Just a heading', {
    mdastPlugins: [readingTimePlugin],
    data,
  });
  assert(data.astro.frontmatter.readingTime != null, 'headings alone should trigger compute');
});

await test('reading-time: each document gets its own count (factory-per-document contract)', async () => {
  const plugins = [readingTimePlugin];
  const first = astroData();
  const second = astroData();
  await markdownToHtml('One two three.', { mdastPlugins: plugins, data: first });
  await markdownToHtml('One two three four five six.', { mdastPlugins: plugins, data: second });
  const a = first.astro.frontmatter.readingTime;
  const b = second.astro.frontmatter.readingTime;
  assert(a != null && b != null, 'both documents should get a readingTime');
  assert(a.words === 3 && b.words === 6, `expected 3 and 6 words, got ${a?.words} and ${b?.words}`);
});

summarize();
