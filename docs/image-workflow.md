# Image Workflow

How images are handled in this repository, why they live in `public/` instead of `src/`, and the standard conversion procedure.

## Why `public/` instead of `src/`

Astro's official recommendation is to put local images in `src/` so Astro can optimize them at build time. This repository deliberately keeps article images in `public/` instead.

| Factor | `src/` (Astro default) | `public/` (this repo) |
|--------|------------------------|-----------------------|
| Format optimization | Astro converts to WebP by default (quality 80) | AVIF files served as-is |
| Build time | Decodes and re-encodes every image | Copies files unchanged |
| Markdown syntax | Requires imports or `image()` schema | Simple `![alt](/posts/slug/image.avif)` |
| Responsive sizes | Auto-generated `srcset` | Not available |
| Lazy loading / CLS | Auto-injected | Not available |

All article images are manually pre-optimized as AVIF before being committed. AVIF is already the most efficient web image format. Astro's re-encoding pipeline would decode AVIF and re-encode as WebP (default) or re-encode as AVIF with Sharp's default parameters (quality 50). This is a net loss.

Blog post images are typically displayed at a fixed width, so responsive multi-size generation offers marginal benefit. The build time cost of re-encoding dozens of screenshots per build is non-trivial on Cloudflare Pages. The Markdown authoring experience is simpler with URL paths than with ESM imports.

See [ADR-0001](adr/0001-public-images.md) for the formal decision record.

## AVIF conversion specification

Use **Sharp** (`sharp` npm package, already in the dependency tree).

```js
{
  quality: 65,              // 1–100; 65 balances visual quality and file size
  effort: 6,                // 0–9; higher = smaller file, slower encoding
  chromaSubsampling: '4:2:0' // standard web chroma subsampling
}
```

- `effort: 6` is higher than Sharp's default (`4`) because image conversion is a one-time operation, not a per-build cost.
- `quality: 65` is slightly above Sharp's AVIF default (`50`) to avoid visible artifacts on screenshots containing UI text.

### Directory structure

```
public/posts/<article-slug>/
  └── <article-slug>-<descriptive-name>.avif
```

The `<article-slug>` must match the post's filename slug (e.g., `hello-astro` for `src/content/posts/en/hello-astro.md`). The output filename is automatically prefixed with `<article-slug>-` to keep the `public/posts/` namespace organized.

**Example:**
```
public/posts/hello-astro/
  └── hello-astro-banner.avif
  └── hello-astro-settings-screenshot.avif
```

## Converting images

```bash
pnpm exec tsx scripts/convert-to-avif.mjs <input-path> <slug>
```

- `<input-path>` can be a single image file or a directory containing multiple images.
- The script creates `public/posts/<slug>/`, converts every image to AVIF with the parameters above, and deletes the original input files.
- Use `--keep` to preserve original files after conversion.

Or use the package.json alias:

```bash
pnpm convert-images <input> <slug>
```

Reference the image in Markdown:

```markdown
![Alt text](/posts/<slug>/<filename>.avif)
```

Run checks after adding images:

```bash
pnpm check
```

The `check:images` step (`scripts/check-image-formats.js`) will fail the build if any non-whitelisted image format (e.g., `.png`, `.jpg`) is found in `public/`.
