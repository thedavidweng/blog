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

    vfile.data.astro.frontmatter.readingTime = readingTime;
  };
}
