import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteConfig } from '../src/site.config';

const root = fileURLToPath(new URL('..', import.meta.url));
const postsRoot = join(root, 'src/content/posts');
const locales = ['en', 'zh'] as const;

type Frontmatter = {
  draft?: boolean;
  locale: string;
  slug: string;
  tags: string[];
};

async function listPostFiles(locale: string) {
  const dir = join(postsRoot, locale);
  const files = await readdir(dir);
  return files.filter((file) => file.endsWith('.md')).sort();
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function parseFrontmatter(file: string, body: string): Frontmatter {
  const match = body.match(/^---\n([\s\S]*?)\n---/);
  assert(match, `${file} is missing frontmatter`);

  const frontmatter = match[1];
  const getString = (key: string) => {
    const value = frontmatter.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?\\s*$`, 'm'))?.[1];
    assert(value, `${file} is missing ${key} frontmatter`);
    return value;
  };

  const tagsBlock = frontmatter.match(/^tags:\n((?:\s+-\s+.+\n?)+)/m)?.[1];
  assert(tagsBlock, `${file} is missing tags frontmatter`);
  const tags = [...tagsBlock.matchAll(/^\s+-\s+(.+?)\s*$/gm)].map((tagMatch) => tagMatch[1]);
  assert(tags.length > 0, `${file} must list at least one tag id`);

  return {
    draft: frontmatter.match(/^draft:\s*true\s*$/m) ? true : undefined,
    locale: getString('locale'),
    slug: getString('slug'),
    tags
  };
}

const filesByLocale = Object.fromEntries(await Promise.all(locales.map(async (locale) => [locale, await listPostFiles(locale)]))) as Record<
  (typeof locales)[number],
  string[]
>;

const entriesByLocale = Object.fromEntries(
  await Promise.all(
    locales.map(async (locale) => {
      const entries = await Promise.all(
        filesByLocale[locale].map(async (file) => {
          const body = await readFile(join(postsRoot, locale, file), 'utf8');
          return { file, frontmatter: parseFrontmatter(`${locale}/${file}`, body) };
        })
      );
      return [locale, entries];
    })
  )
) as Record<(typeof locales)[number], Array<{ file: string; frontmatter: Frontmatter }>>;

for (const locale of locales) {
  for (const { file, frontmatter } of entriesByLocale[locale]) {
    assert(frontmatter.locale === locale, `${locale}/${file} has locale "${frontmatter.locale}"`);
    for (const tag of frontmatter.tags) {
      assert(tag in siteConfig.tags, `${locale}/${file} uses unknown tag id "${tag}"`);
    }
  }
}

const publishedSlugsByLocale = Object.fromEntries(
  locales.map((locale) => [
    locale,
    entriesByLocale[locale]
      .filter(({ frontmatter }) => !frontmatter.draft)
      .map(({ frontmatter }) => frontmatter.slug)
      .sort()
  ])
) as Record<(typeof locales)[number], string[]>;

const reference = publishedSlugsByLocale.en.join('\n');
assert(publishedSlugsByLocale.en.length > 0, 'Expected at least one translated post pair.');

for (const locale of locales) {
  assert(
    publishedSlugsByLocale[locale].join('\n') === reference,
    `Published post slugs must match English slugs. en=[${publishedSlugsByLocale.en.join(', ')}] ${locale}=[${publishedSlugsByLocale[locale].join(', ')}]`
  );
}

console.log(`Content contract ok: ${publishedSlugsByLocale.en.length} translated post pair(s).`);
