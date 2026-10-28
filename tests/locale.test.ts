import {
  alternateLocale,
  defaultLocale,
  delocalizePath,
  locales,
  localeTag,
  isLocale,
  getLocaleBase,
  localizedPath,
  ogLocaleTag,
  postUrl,
  tagUrl,
  ogImagePath,
} from '../src/lib/locale';
import { assert, test } from './harness';

test('isLocale: returns true for valid locales', () => {
  assert(isLocale('en') === true, "'en' should be a valid locale");
  assert(isLocale('zh') === true, "'zh' should be a valid locale");
});

test('isLocale: returns false for invalid locales', () => {
  assert(isLocale('fr') === false, "'fr' should not be a valid locale");
  assert(isLocale('') === false, 'empty string should not be a valid locale');
  assert(isLocale('EN') === false, "'EN' should not be a valid locale (case-sensitive)");
});

test('getLocaleBase: returns empty string for default locale', () => {
  assert(getLocaleBase('en') === '', 'default locale should have empty base');
});

test('getLocaleBase: returns /zh for non-default locale', () => {
  assert(getLocaleBase('zh') === '/zh', 'zh locale should have /zh base');
});

test('localizedPath: returns path as-is for default locale', () => {
  assert(localizedPath('en', '/tags/') === '/tags/', 'default locale should not prefix');
  assert(localizedPath('en', '/about/') === '/about/', 'default locale should not prefix');
});

test('localizedPath: prefixes path for non-default locale', () => {
  assert(localizedPath('zh', '/tags/') === '/zh/tags/', 'zh locale should prefix /zh/');
  assert(localizedPath('zh', '/about/') === '/zh/about/', 'zh locale should prefix /zh/');
});

test('localizedPath: defaults to root when no path given', () => {
  assert(localizedPath('en') === '/', 'default locale root should be /');
  assert(localizedPath('zh') === '/zh/', 'zh locale root should be /zh/');
});

test('localizedPath: handles root path for non-default locale', () => {
  assert(localizedPath('zh', '/') === '/zh/', 'zh locale with root path should be /zh/');
});

test('localizedPath: prepends slash if missing', () => {
  assert(localizedPath('en', 'tags/') === '/tags/', 'should prepend slash if missing');
  assert(localizedPath('zh', 'tags/') === '/zh/tags/', 'should prepend slash if missing for zh');
});

test('postUrl: no prefix for default locale', () => {
  assert(postUrl('en', 'hello') === '/posts/hello/', 'en post URL should not have prefix');
});

test('postUrl: /zh/ prefix for non-default locale', () => {
  assert(postUrl('zh', 'hello') === '/zh/posts/hello/', 'zh post URL should have /zh/ prefix');
});

test('tagUrl: encodes tag name', () => {
  assert(tagUrl('en', 'Finance') === '/tags/Finance/', 'en tag URL');
  assert(tagUrl('zh', 'Finance') === '/zh/tags/Finance/', 'zh tag URL');
  assert(tagUrl('en', 'C++') === '/tags/C%2B%2B/', 'should encode special characters');
});

test('ogImagePath: no prefix for default locale', () => {
  assert(ogImagePath('en', 'hello') === '/og/hello.png', 'en OG path should not have prefix');
});

test('ogImagePath: /zh/ prefix for non-default locale', () => {
  assert(ogImagePath('zh', 'hello') === '/zh/og/hello.png', 'zh OG path should have /zh/ prefix');
});

test('delocalizePath: inverse of localizedPath for every locale and path', () => {
  for (const locale of locales) {
    for (const path of ['/', '/tags/', '/posts/hello/', '/about/']) {
      const roundTripped = delocalizePath(localizedPath(locale, path));
      assert(roundTripped === path, `${locale} ${path}: got ${roundTripped}`);
    }
  }
});

test('delocalizePath: leaves default-locale paths and lookalikes alone', () => {
  assert(delocalizePath('/tags/') === '/tags/', 'unprefixed path should pass through');
  assert(delocalizePath('/zhota/') === '/zhota/', 'prefix must match a whole segment');
  assert(delocalizePath('/posts/zh-tools/') === '/posts/zh-tools/', 'mid-path zh is not a prefix');
  assert(delocalizePath('/zh') === '/', 'bare locale base maps to root');
});

test('alternateLocale: returns the other locale', () => {
  assert(alternateLocale('en') === 'zh', 'en alternates to zh');
  assert(alternateLocale('zh') === 'en', 'zh alternates to en');
});

test('locale tags: BCP-47 and OpenGraph forms', () => {
  assert(localeTag.en === 'en' && localeTag.zh === 'zh-CN', 'html/hreflang tags');
  assert(ogLocaleTag.en === 'en_US' && ogLocaleTag.zh === 'zh_CN', 'og:locale tags');
});

test('constants: defaultLocale is en', () => {
  assert(defaultLocale === 'en', "defaultLocale should be 'en'");
});

test('constants: locales contains en and zh', () => {
  assert(locales.includes('en'), "locales should include 'en'");
  assert(locales.includes('zh'), "locales should include 'zh'");
  assert(locales.length === 2, 'locales should have exactly 2 entries');
});
