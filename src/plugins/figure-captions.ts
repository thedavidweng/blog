import { defineHastPlugin } from 'satteri';

/**
 * Paragraphs that contain only image(s) (optional soft breaks / whitespace between)
 * become one figure per image; non-empty alt → figcaption (bottom-right in CSS).
 */
export const figureCaptionsPlugin = defineHastPlugin({
  name: 'figure-captions',
  element: {
    filter: ['p'],
    visit(node, ctx) {
      const substantive = node.children.filter((c: any) => !isSkippableBetweenImages(c));
      if (substantive.length === 0) return;
      if (!substantive.every((c: any) => c.type === 'element' && c.tagName === 'img')) return;

      const figures = substantive.map((child: any) => buildFigure(child));

      // replaceNode on HAST accepts a single node, not an array.
      // For a single figure, replace directly. For multiple, replace the
      // paragraph with the first figure and insert the rest after it.
      if (figures.length === 1) {
        ctx.replaceNode(node, figures[0]);
      } else {
        ctx.replaceNode(node, figures[0]);
        let after = node;
        for (let i = 1; i < figures.length; i++) {
          ctx.insertAfter(after, figures[i]);
          after = figures[i];
        }
      }
    },
  },
});

function buildFigure(img: any): any {
  const alt = String(img.properties?.alt ?? '').trim();

  // Copy only property values Sätteri's op-stream can encode
  // (string / number / boolean / array-of-string). Non-encodable values
  // (e.g. objects, null) would throw "cannot encode replacement content".
  const imgProps: Record<string, unknown> = {};
  if (img.properties) {
    for (const [key, value] of Object.entries(img.properties)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        imgProps[key] = value;
      } else if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
        imgProps[key] = value;
      }
    }
  }

  const figureChildren: any[] = [
    {
      type: 'element',
      tagName: 'img',
      properties: imgProps,
      children: [],
    },
  ];
  if (alt) {
    figureChildren.push({
      type: 'element',
      tagName: 'figcaption',
      properties: { className: ['post-figure-caption'] },
      children: [{ type: 'text', value: alt }],
    });
  }

  return {
    type: 'element',
    tagName: 'figure',
    properties: { className: ['post-figure'] },
    children: figureChildren,
  };
}

/** Soft breaks, line ends, and invisible unicode often appear between stacked Markdown images. */
function isSkippableBetweenImages(node: any): boolean {
  if (node.type === 'text') {
    return !/[^\s\u200B-\u200D\uFEFF]/.test(node.value);
  }
  if (node.type === 'element') {
    const t = node.tagName;
    return t === 'br' || t === 'wbr';
  }
  return false;
}
