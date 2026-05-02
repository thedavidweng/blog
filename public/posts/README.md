# Post images (`public/posts`)

Static assets for posts live under **one folder per post slug**. Reference them from Markdown as `![](/posts/{slug}/filename.avif)`.

This file is deployed with the site (reachable at `/posts/README.md`). Keep it accurate when rules change.

## Naming rules

1. **ASCII kebab-case only**: lowercase letters, digits, hyphens. No spaces, CJK in filenames, `CamelCase`, `snake_case`, or stacked extensions.
2. **Folder matches post slug**: URL path `/posts/<post-slug>/…` must match the post’s `slug` in `src/content/posts/**`.
3. **Describe content**: use readable semantic names (e.g. `fedex-support-chat-1.avif`). For ordered screenshots use zero-padded suffixes: `topic-screen-01.avif`, `topic-screen-02.avif`.
4. **Do not commit**: camera rolls (`IMG_0763`), UUIDs, raw timestamps, `Screenshot_2023-…`, meaningless hashes. Convert to AVIF and rename before linking.
5. **Format**: prefer **AVIF**. If you replace an asset, update **all** Markdown/MDX references or keep the filename stable.
6. **Alt text**: `![caption](/posts/…)` should be a human caption in the same language as the post (shown as figcaption); do not paste the filename as the caption.

## Agent checklist

- Confirm the destination folder’s slug matches frontmatter before adding files.
- Avoid “temporary” filenames in commits; rename before merge.
- After renames, search the repo for `/posts/` paths (`.md`, `.mdx`, etc.).
- On macOS default volumes (**case-insensitive**), avoid renames that only change letter case—pick distinct names instead.
