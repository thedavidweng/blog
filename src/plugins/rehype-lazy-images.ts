import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

import probe from 'probe-image-size';
import fs from 'node:fs';
import path from 'node:path';

/** Default lazy-loading and auto-sizing for inline Markdown images (build-time). */
export function rehypeLazyImages() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;
      const props = node.properties ?? (node.properties = {});
      if (props.loading == null) props.loading = 'lazy';
      if (props.decoding == null) props.decoding = 'async';

      // Automatically infer width and height to prevent CLS for images in /public
      if (typeof props.src === 'string' && props.src.startsWith('/')) {
        try {
          const imagePath = path.join(process.cwd(), 'public', props.src);
          if (fs.existsSync(imagePath)) {
            const data = fs.readFileSync(imagePath);
            const dimensions = probe.sync(data);
            if (dimensions) {
              if (props.width == null) props.width = dimensions.width;
              if (props.height == null) props.height = dimensions.height;
            }
          }
        } catch (e) {
          // Ignore if file is not found or cannot be probed
        }
      }
    });
  };
}
