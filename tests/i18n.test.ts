import { publishedLabel, t, tagLabel, tags, ui } from '../src/config/i18n';
import { locales } from '../src/lib/locale';
import { assert, summarize, test } from './harness';

await test('ui: every locale exposes the same keys', () => {
  const enKeys = Object.keys(ui.en).toSorted().join(',');
  for (const locale of locales) {
    const keys = Object.keys(ui[locale]).toSorted().join(',');
    assert(keys === enKeys, `${locale} must define exactly the en key set`);
  }
});

await test('t: returns the table for the requested locale', () => {
  assert(t('en').homeTitle === 'Blog', 'en home title');
  assert(t('zh').homeTitle === '博客', 'zh home title');
});

await test('ui: parameterized copy renders for both locales', () => {
  for (const locale of locales) {
    const copy = t(locale);
    assert(copy.aboutName('David').includes('David'), `${locale} aboutName`);
    assert(copy.aboutDescription('David').includes('David'), `${locale} aboutDescription`);
    assert(copy.taggedDescription('Tools').includes('Tools'), `${locale} taggedDescription`);
    assert(copy.publishedOn('2026').includes('2026'), `${locale} publishedOn`);
    assert(copy.readingTime(5).includes('5'), `${locale} readingTime`);
  }
});

await test('publishedLabel: locale-specific date phrasing', () => {
  const date = new Date('2026-07-25T00:00:00Z');
  const en = publishedLabel('en', date);
  assert(en === 'Published on July 25, 2026', `unexpected en label: ${en}`);
  const zh = publishedLabel('zh', date);
  assert(zh.startsWith('发布于') && zh.includes('2026'), `unexpected zh label: ${zh}`);
});

await test('tagLabel: returns the locale label and rejects unknown tags', () => {
  assert(tagLabel('en', 'Finance') === 'Finance', 'en label');
  assert(tagLabel('zh', 'Finance') === '财务', 'zh label');
  let threw = false;
  try {
    tagLabel('en', 'NotATag');
  } catch {
    threw = true;
  }
  assert(threw, 'unknown tag must throw');
});

await test('tags: every tag has a label for every locale', () => {
  for (const [id, labels] of Object.entries(tags)) {
    for (const locale of locales) {
      assert(labels[locale].length > 0, `tag ${id} missing ${locale} label`);
    }
  }
});

summarize();
