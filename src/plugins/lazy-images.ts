import { defineHastPlugin } from 'satteri';

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

export type ImageProbe = (src: string) => Promise<{ width?: number; height?: number } | undefined>;

const probePublicImage: ImageProbe = async (src) => {
  const imagePath = path.join(process.cwd(), 'public', src);
  if (!fs.existsSync(imagePath)) return undefined;
  return sharp(imagePath).metadata();
};

// Probe local image dimensions to prevent CLS.
async function applyProbedDimensions(node: any, ctx: any, probe: ImageProbe, src: string) {
  try {
    const m = await probe(src);
    const props = node.properties ?? {};
    if (m?.width != null && props.width == null) ctx.setProperty(node, 'width', m.width);
    if (m?.height != null && props.height == null) ctx.setProperty(node, 'height', m.height);
  } catch {
    /* unreadable image: ship without dimensions */
  }
}

export const lazyImagesPlugin = (options?: { probe?: ImageProbe }) => {
  const probe = options?.probe ?? probePublicImage;
  return defineHastPlugin({
    name: 'lazy-images',
    element: {
      filter: ['img'],
      async visit(node, ctx) {
        const props = node.properties ?? {};

        if (props.loading == null) ctx.setProperty(node, 'loading', 'lazy');
        if (props.decoding == null) ctx.setProperty(node, 'decoding', 'async');

        const src = typeof props.src === 'string' ? props.src : '';
        // Add no-referrer to bypass hotlink protection for external images (e.g. Bilibili link cards)
        if (src.startsWith('http')) ctx.setProperty(node, 'referrerPolicy', 'no-referrer');
        if (src.startsWith('/')) await applyProbedDimensions(node, ctx, probe, src);
      },
    },
  });
};
