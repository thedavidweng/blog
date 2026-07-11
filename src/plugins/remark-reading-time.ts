import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';
import type { Root } from 'mdast';

interface VFileData {
  astro: {
    frontmatter: Record<string, unknown>;
  };
}

interface VFileLike {
  data: VFileData;
}

export function remarkReadingTime() {
  return function (tree: Root, vfile: VFileLike) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);

    // Customize reading time logic for Chinese and English.
    // reading-time uses english word lengths by default. For Chinese, we can just use the characters.
    // However, reading-time already handles CJK characters well by counting them as words.
    vfile.data.astro.frontmatter.readingTime = readingTime;
  };
}
