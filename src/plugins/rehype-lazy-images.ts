import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

/** Default lazy-loading for inline Markdown images (build-time). */
export function rehypeLazyImages() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;
      const props = node.properties ?? (node.properties = {});
      if (props.loading == null) props.loading = 'lazy';
      if (props.decoding == null) props.decoding = 'async';
    });
  };
}
