import getReadingTime from 'reading-time';
import { defineMdastPlugin } from 'satteri';

/** Computes reading time from the full document text and stores it in frontmatter. */
export const readingTimePlugin = () => {
  let done = false;
  return defineMdastPlugin({
    name: 'reading-time',
    paragraph(node, ctx) {
      if (done) return;
      done = true;
      let root = ctx.parent(node);
      if (!root) return;
      while (ctx.parent(root) !== undefined) root = ctx.parent(root)!;
      ctx.data.astro!.frontmatter.readingTime = getReadingTime(ctx.textContent(root));
    },
  });
};
