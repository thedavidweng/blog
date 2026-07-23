import {
  defaultLocale,
  locales,
  isLocale,
  getLocaleBase,
  localizedPath,
  postUrl,
  tagUrl,
  ogImagePath,
} from '../src/lib/locale';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    failed++;
    console.error(`  FAIL  ${name}`);
    console.error(`        ${e}`);
  }
}

// ── isLocale ──────────────────────────────────────────────────────────────────

test('isLocale: returns true for valid locales', () => {
  assert(isLocale('en') === true, "'en' should be a valid locale");
  assert(isLocale('zh') === true, "'zh' should be a valid locale");
});

test('isLocale: returns false for invalid locales', () => {
  assert(isLocale('fr') === false, "'fr' should not be a valid locale");
  assert(isLocale('') === false, "empty string should not be a valid locale");
  assert(isLocale('EN') === false, "'EN' should not be a valid locale (case-sensitive)");
});

test('isLocale: acts as a type guard', () => {
  const value: string = 'zh';
  if (isLocale(value)) {
    // If the type guard works, this line compiles and runs
    assert(value === 'zh', 'type guard should narrow to Locale');
  } else {
    throw new Error('type guard should have narrowed');
  }
});

// ── getLocaleBase ─────────────────────────────────────────────────────────────

test('getLocaleBase: returns empty string for default locale', () => {
  assert(getLocaleBase('en') === '', "default locale should have empty base");
});

test('getLocaleBase: returns /zh for non-default locale', () => {
  assert(getLocaleBase('zh') === '/zh', "zh locale should have /zh base");
});

// ── localizedPath ─────────────────────────────────────────────────────────────

test('localizedPath: returns path as-is for default locale', () => {
  assert(localizedPath('en', '/tags/') === '/tags/', "default locale should not prefix");
  assert(localizedPath('en', '/about/') === '/about/', "default locale should not prefix");
});

test('localizedPath: prefixes path for non-default locale', () => {
  assert(localizedPath('zh', '/tags/') === '/zh/tags/', "zh locale should prefix /zh/");
  assert(localizedPath('zh', '/about/') === '/zh/about/', "zh locale should prefix /zh/");
});

test('localizedPath: defaults to root when no path given', () => {
  assert(localizedPath('en') === '/', "default locale root should be /");
  assert(localizedPath('zh') === '/zh/', "zh locale root should be /zh/");
});

test('localizedPath: handles root path for non-default locale', () => {
  assert(localizedPath('zh', '/') === '/zh/', "zh locale with root path should be /zh/");
});

test('localizedPath: prepends slash if missing', () => {
  assert(localizedPath('en', 'tags/') === '/tags/', "should prepend slash if missing");
  assert(localizedPath('zh', 'tags/') === '/zh/tags/', "should prepend slash if missing for zh");
});

// ── postUrl ───────────────────────────────────────────────────────────────────

test('postUrl: no prefix for default locale', () => {
  assert(postUrl('en', 'hello') === '/posts/hello/', "en post URL should not have prefix");
});

test('postUrl: /zh/ prefix for non-default locale', () => {
  assert(postUrl('zh', 'hello') === '/zh/posts/hello/', "zh post URL should have /zh/ prefix");
});

// ── tagUrl ────────────────────────────────────────────────────────────────────

test('tagUrl: encodes tag name', () => {
  assert(tagUrl('en', 'Finance') === '/tags/Finance/', "en tag URL");
  assert(tagUrl('zh', 'Finance') === '/zh/tags/Finance/', "zh tag URL");
  assert(tagUrl('en', 'C++') === '/tags/C%2B%2B/', "should encode special characters");
});

// ── ogImagePath ───────────────────────────────────────────────────────────────

test('ogImagePath: no prefix for default locale', () => {
  assert(ogImagePath('en', 'hello') === '/og/hello.png', "en OG path should not have prefix");
});

test('ogImagePath: /zh/ prefix for non-default locale', () => {
  assert(ogImagePath('zh', 'hello') === '/zh/og/hello.png', "zh OG path should have /zh/ prefix");
});

// ── constants ─────────────────────────────────────────────────────────────────

test('constants: defaultLocale is en', () => {
  assert(defaultLocale === 'en', "defaultLocale should be 'en'");
});

test('constants: locales contains en and zh', () => {
  assert(locales.includes('en'), "locales should include 'en'");
  assert(locales.includes('zh'), "locales should include 'zh'");
  assert(locales.length === 2, "locales should have exactly 2 entries");
});

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
