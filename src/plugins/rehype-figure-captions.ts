import type { Element, ElementContent, Root } from 'hast';
import { visit } from 'unist-util-visit';

/**
 * Paragraphs that contain only image(s) (optional soft breaks / whitespace between)
 * become one figure per image; non-empty alt → figcaption (bottom-right in CSS).
 */
export function rehypeFigureCaptions() {
  return (tree: Root) => {
    const patches: Array<{ parent: Element; index: number; figures: Element[] }> = [];

    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'p' || !parent || typeof index !== 'number') return;

      const substantive = node.children.filter((c) => !isSkippableBetweenImages(c));
      if (substantive.length === 0) return;
      if (!substantive.every((c) => c.type === 'element' && (c as Element).tagName === 'img')) return;

      const figures = substantive.map((child) => buildFigure(child as Element));
      patches.push({ parent: parent as Element, index, figures });
    });

    const byParent = new Map<Element, Array<{ index: number; figures: Element[] }>>();
    for (const { parent, index, figures } of patches) {
      const arr = byParent.get(parent) ?? [];
      arr.push({ index, figures });
      byParent.set(parent, arr);
    }

    for (const [parent, arr] of byParent) {
      arr.sort((a, b) => b.index - a.index);
      for (const { index, figures } of arr) {
        parent.children.splice(index, 1, ...figures);
      }
    }
  };
}

function buildFigure(img: Element): Element {
  const alt = String(img.properties?.alt ?? '').trim();

  const imgCopy: Element = {
    type: 'element',
    tagName: 'img',
    properties: img.properties ? { ...img.properties } : {},
    children: []
  };

  // Do not strip the alt attribute to maintain accessibility.
  // The image should retain the alt text matching the caption.

  const figureChildren: ElementContent[] = [imgCopy];
  if (alt) {
    figureChildren.push({
      type: 'element',
      tagName: 'figcaption',
      properties: { className: ['post-figure-caption'] },
      children: [{ type: 'text', value: alt }]
    });
  }

  return {
    type: 'element',
    tagName: 'figure',
    properties: { className: ['post-figure'] },
    children: figureChildren
  };
}

/** Soft breaks, line ends, and invisible unicode often appear between stacked Markdown images. */
function isSkippableBetweenImages(node: ElementContent): boolean {
  if (node.type === 'text') {
    return !/[^\s\u200B-\u200D\uFEFF]/.test(node.value);
  }
  if (node.type === 'element') {
    const t = (node as Element).tagName;
    return t === 'br' || t === 'wbr';
  }
  return false;
}
