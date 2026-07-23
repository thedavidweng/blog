import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

/** Default lazy-loading and auto-sizing for inline Markdown images (build-time). */
export function rehypeLazyImages() {
  return async (tree: Root) => {
    const localImages: Array<{ props: Record<string, unknown>; src: string }> = [];

    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'img') return;
      const props = node.properties ?? (node.properties = {});
      if (props.loading == null) props.loading = 'lazy';
      if (props.decoding == null) props.decoding = 'async';

      // Add no-referrer to bypass hotlink protection for external images (e.g. Bilibili link cards)
      if (typeof props.src === 'string' && props.src.startsWith('http')) {
        props.referrerPolicy = 'no-referrer';
      }

      // Collect local images for async dimension probing (prevents CLS).
      if (typeof props.src === 'string' && props.src.startsWith('/')) {
        localImages.push({ props, src: props.src });
      }
    });

    await Promise.all(
      localImages.map(async ({ props, src }) => {
        try {
          const imagePath = path.join(process.cwd(), 'public', src);
          if (!fs.existsSync(imagePath)) return;
          const m = await sharp(imagePath).metadata();
          if (m.width != null && props.width == null) props.width = m.width;
          if (m.height != null && props.height == null) props.height = m.height;
        } catch {
          // Ignore if file is not found or cannot be probed
        }
      }),
    );
  };
}
