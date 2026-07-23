import getReadingTime from 'reading-time';
import { defineMdastPlugin } from 'satteri';

/** Computes reading time from the full document text and stores it in frontmatter. */
export const readingTimePlugin = () => {
  let done = false;
  const compute = (node: any, ctx: any) => {
    if (done) return;
    done = true;
    let root = ctx.parent(node);
    if (!root) return;
    while (ctx.parent(root) !== undefined) root = ctx.parent(root)!;
    ctx.data.astro!.frontmatter.readingTime = getReadingTime(ctx.textContent(root));
  };
  return defineMdastPlugin({
    name: 'reading-time',
    // Fire on any block-level node — the `done` flag ensures we compute once.
    // Covers posts that contain only headings, code blocks, lists, etc.
    paragraph: compute,
    heading: compute,
    code: compute,
    list: compute,
    blockquote: compute,
    table: compute,
    html: compute,
  });
};
