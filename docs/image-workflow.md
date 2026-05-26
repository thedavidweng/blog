# Image Workflow

This document explains how images are handled in this repository, why they live in `public/` instead of `src/`, and the standard procedure for converting article images to AVIF.

## Why `public/` instead of `src/`

Astro's official recommendation is to put local images in `src/` so Astro can optimize them at build time. This repository deliberately keeps article images in `public/` instead.

### Decision record

| Factor | `src/` (Astro default) | `public/` (this repo) |
|--------|------------------------|-----------------------|
| Format optimization | Astro converts to WebP by default (quality 80) | AVIF files served as-is |
| Build time | Decodes and re-encodes every image | Copies files unchanged |
| Markdown syntax | Requires imports or `image()` schema | Simple `![alt](/posts/slug/image.avif)` |
| Responsive sizes | Auto-generated `srcset` | Not available |
| Lazy loading / CLS | Auto-injected | Not available |

**Rationale:**

1. All article images are manually pre-optimized as AVIF before being committed. AVIF is already the most efficient web image format. Astro's re-encoding pipeline would decode AVIF and re-encode as WebP (default) or re-encode as AVIF with Sharp's default parameters (quality 50). This is a net loss, not a gain.

2. Blog post images are typically displayed at a fixed width. Responsive multi-size generation offers marginal benefit for this use case.

3. The build time cost of re-encoding dozens of screenshots per build is non-trivial on Cloudflare Pages. `public/` images are copied as-is, keeping builds fast.

4. The Markdown authoring experience is simpler with URL paths than with ESM imports or Content Collections `image()` schema.

**Conclusion:** `public/` is the pragmatic choice for a repository where images are already optimally encoded as AVIF.

## AVIF conversion specification

### Tool

Use **Sharp** (`sharp` npm package). It is already in this repository's dependency tree (Astro's default image service).

### Parameters

```js
{
  quality: 65,              // 1–100; 65 balances visual quality and file size
  effort: 6,                // 0–9; higher = smaller file, slower encoding
  chromaSubsampling: '4:2:0' // standard web chroma subsampling
}
```

- `effort: 6` is higher than Sharp's default (`4`) because image conversion is a one-time operation, not a per-build cost. The extra compression is worth the wait.
- `quality: 65` is slightly above Sharp's AVIF default (`50`) to avoid visible artifacts on screenshots containing UI text.

### Directory structure

```
public/posts/<article-slug>/
  └── <article-slug>-<descriptive-name>.avif
```

The `<article-slug>` must match the post's filename slug (e.g., `hello-astro` for `src/content/posts/en/hello-astro.md`). The output filename is automatically prefixed with `<article-slug>-` to keep the `public/posts/` namespace organized and make image origins immediately identifiable.

**Example:**
```
public/posts/hello-astro/
  └── hello-astro-banner.avif
  └── hello-astro-settings-screenshot.avif
```

## Agent operation guide

When adding images for a new article, follow these steps:

1. **Confirm the article slug** matches both `src/content/posts/en/<slug>.md` and `src/content/posts/zh/<slug>.md`.

2. **Run the conversion script:**
   ```bash
   pnpm install                              # if dependencies are not yet installed
   pnpm exec tsx scripts/convert-to-avif.mjs <input-path> <slug>
   ```

   - `<input-path>` can be a single image file or a directory containing multiple images.
   - The script creates `public/posts/<slug>/`, converts every image to AVIF with the parameters above, and deletes the original input files.
   - Use `--keep` to preserve original files after conversion.

3. **Reference the image in Markdown:**
   ```markdown
   ![Alt text](/posts/<slug>/<filename>.avif)
   ```

4. **Run checks:**
   ```bash
   pnpm check
   ```

   The `check:images` step (`scripts/check-image-formats.js`) will fail the build if any non-whitelisted image format (e.g., `.png`, `.jpg`) is found in `public/`.

## Adding a script alias

If you run conversions frequently, add this to `package.json` under `scripts`:

```json
"convert-images": "tsx scripts/convert-to-avif.mjs"
```

Then use: `pnpm convert-images <input> <slug>`
