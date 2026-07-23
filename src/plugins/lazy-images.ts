import { defineHastPlugin } from 'satteri';

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

/** Default lazy-loading and auto-sizing for inline Markdown images (build-time). */
export const lazyImagesPlugin = defineHastPlugin({
  name: 'lazy-images',
  element: {
    filter: ['img'],
    async visit(node, ctx) {
      const props = node.properties ?? {};

      if (props.loading == null) ctx.setProperty(node, 'loading', 'lazy');
      if (props.decoding == null) ctx.setProperty(node, 'decoding', 'async');

      // Add no-referrer to bypass hotlink protection for external images (e.g. Bilibili link cards)
      if (typeof props.src === 'string' && props.src.startsWith('http')) {
        ctx.setProperty(node, 'referrerPolicy', 'no-referrer');
      }

      // Probe local image dimensions to prevent CLS.
      if (typeof props.src === 'string' && props.src.startsWith('/')) {
        try {
          const imagePath = path.join(process.cwd(), 'public', props.src);
          if (!fs.existsSync(imagePath)) return;
          const m = await sharp(imagePath).metadata();
          if (m.width != null && props.width == null) ctx.setProperty(node, 'width', m.width);
          if (m.height != null && props.height == null) ctx.setProperty(node, 'height', m.height);
        } catch {
          // Ignore if file is not found or cannot be probed
        }
      }
    },
  },
});
