import { readdir, readFile, access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { siteConfig } from "../src/site.config";

const root = fileURLToPath(new URL("..", import.meta.url));
const postsRoot = join(root, "src/content/posts");
const publicRoot = join(root, "public");
const locales = ["en", "zh"] as const;

type Frontmatter = {
  draft?: boolean;
  locale: string;
  slug: string;
  tags: string[];
};

async function listPostFiles(locale: string) {
  const dir = join(postsRoot, locale);
  const files = await readdir(dir);
  return files
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .sort();
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// Validate that boolean fields in frontmatter use valid YAML 1.2 boolean literals.
// Strings like "no", "yes", "on", "off" are NOT booleans in YAML 1.2 and will
// cause Astro's z.boolean() schema validation to fail at build time.
// See: https://yaml.org/spec/1.2.2/#1032-tag-resolution-directives
// Valid YAML 1.2 booleans: true, false, True, False, TRUE, FALSE
function validateYamlBooleans(file: string, frontmatterBlock: string): void {
  const booleanFields = ["draft", "narrowFigures"];
  for (const field of booleanFields) {
    const match = frontmatterBlock.match(
      new RegExp(`^${field}:\\s*(\\S+)`, "m"),
    );
    if (!match) continue; // field not present — optional fields may be absent
    const rawValue = match[1];
    // Strip inline comment if present (e.g. "false  # draft post")
    const value = rawValue.split("#")[0].trim();
    const validBooleans = ["true", "false", "True", "False", "TRUE", "FALSE"];
    if (!validBooleans.includes(value)) {
      throw new Error(
        `${file}: field "${field}" must be a YAML 1.2 boolean, ` +
          `found "${value}" (type: string in YAML 1.2).\n` +
          `  Valid values: true, false, True, False, TRUE, FALSE\n` +
          `  Values like "no", "yes", "on", "off" are strings in YAML 1.2, not booleans.\n` +
          `  Fix example: use "draft: false" instead of "draft: no".`,
      );
    }
  }
}

function parseFrontmatter(file: string, body: string): Frontmatter {
  const match = body.match(/^---\n([\s\S]*?)\n---/);
  assert(match, `${file} is missing frontmatter`);

  const frontmatter = match[1];
  validateYamlBooleans(file, frontmatter);

  const getString = (key: string, optional = false) => {
    const value = frontmatter.match(
      new RegExp(`^${key}:\\s*"?([^"\\n]+)"?\\s*$`, "m"),
    )?.[1];
    if (!optional) {
      assert(value, `${file} is missing ${key} frontmatter`);
    }
    return value;
  };

  const tagsBlock = frontmatter.match(/^tags:\n((?:\s+-\s+.+\n?)+)/m)?.[1];
  assert(tagsBlock, `${file} is missing tags frontmatter`);
  const tags = [...tagsBlock.matchAll(/^\s+-\s+(.+?)\s*$/gm)].map(
    (tagMatch) => tagMatch[1],
  );
  assert(tags.length > 0, `${file} must list at least one tag id`);

  return {
    draft: frontmatter.match(/^draft:\s*true\s*$/m) ? true : undefined,
    locale: getString("locale") as string,
    slug:
      getString("slug", true) ?? file.replace(/^.*\/([^/]+)\.(md|mdx)$/, "$1"),
    tags,
  };
}

const filesByLocale = Object.fromEntries(
  await Promise.all(
    locales.map(async (locale) => [locale, await listPostFiles(locale)]),
  ),
) as Record<(typeof locales)[number], string[]>;

const entriesByLocale = Object.fromEntries(
  await Promise.all(
    locales.map(async (locale) => {
      const entries = await Promise.all(
        filesByLocale[locale].map(async (file) => {
          const body = await readFile(join(postsRoot, locale, file), "utf8");
          return {
            file,
            body,
            frontmatter: parseFrontmatter(`${locale}/${file}`, body),
          };
        }),
      );
      return [locale, entries];
    }),
  ),
) as Record<
  (typeof locales)[number],
  Array<{ file: string; body: string; frontmatter: Frontmatter }>
>;

// 1. Validation for each post
for (const locale of locales) {
  const slugs = new Set();
  for (const { file, body, frontmatter } of entriesByLocale[locale]) {
    // Check locale consistency
    assert(
      frontmatter.locale === locale,
      `${locale}/${file} has locale "${frontmatter.locale}" in frontmatter, expected "${locale}"`,
    );

    // Check for duplicate slugs within the same locale
    assert(
      !slugs.has(frontmatter.slug),
      `${locale}/${file} has duplicate slug "${frontmatter.slug}"`,
    );
    slugs.add(frontmatter.slug);

    // Check tags against siteConfig
    for (const tag of frontmatter.tags) {
      assert(
        tag in siteConfig.tags,
        `${locale}/${file} uses unknown tag id "${tag}". Add it to siteConfig.tags.`,
      );
    }

    // Check image references
    const imgMatches = body.matchAll(/!\[.*?\]\((.*?)\)/g);
    for (const match of imgMatches) {
      const imgPath = match[1];
      if (imgPath.startsWith("/")) {
        const fullPath = join(publicRoot, imgPath);
        try {
          await access(fullPath);
        } catch {
          throw new Error(
            `${locale}/${file} references missing image: ${imgPath}`,
          );
        }
      }
    }
  }
}

// 2. Cross-locale validation (Translation completeness)
const publishedSlugsByLocale = Object.fromEntries(
  locales.map((locale) => [
    locale,
    entriesByLocale[locale]
      .filter(({ frontmatter }) => !frontmatter.draft)
      .map(({ frontmatter }) => frontmatter.slug)
      .sort(),
  ]),
) as Record<(typeof locales)[number], string[]>;

const reference = publishedSlugsByLocale.en.join("\n");
assert(
  publishedSlugsByLocale.en.length > 0,
  "Expected at least one translated post pair.",
);

for (const locale of locales) {
  if (publishedSlugsByLocale[locale].join("\n") !== reference) {
    const enSet = new Set(publishedSlugsByLocale.en);
    const currentSet = new Set(publishedSlugsByLocale[locale]);

    const missingInCurrent = publishedSlugsByLocale.en.filter(
      (s) => !currentSet.has(s),
    );
    const extraInCurrent = publishedSlugsByLocale[locale].filter(
      (s) => !enSet.has(s),
    );

    let error = `Translation mismatch for locale "${locale}":\n`;
    if (missingInCurrent.length > 0)
      error += `  - Missing translations (exist in English but not in ${locale}): ${missingInCurrent.join(", ")}\n`;
    if (extraInCurrent.length > 0)
      error += `  - Orphan translations (exist in ${locale} but not in English): ${extraInCurrent.join(", ")}\n`;

    throw new Error(error);
  }
}

console.log(
  `✅ Content contract ok: ${publishedSlugsByLocale.en.length} translated post pair(s) verified.`,
);
