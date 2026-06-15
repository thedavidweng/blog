import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import he from 'he';
import ogs from 'open-graph-scraper';
import sanitize from 'sanitize-filename';
import { visit } from 'unist-util-visit';
import type { Paragraph, Root } from 'mdast';

const defaultSaveDirectory = 'public';
const defaultOutputDirectory = '/remark-link-card/';

export type RemarkLinkCardOptions = {
  shortenUrl?: boolean;
  cache?: boolean;
};

export type LinkCardData = {
  title: string;
  description: string;
  faviconSrc: string;
  ogImageSrc: string;
  ogImageAlt: string;
  displayUrl: string;
  url: string;
};

export type LinkCardFetcher = (url: string) => Promise<LinkCardData>;

/**
 * Link-card blurbs must be plain text. OGS is the right tool; we only drop values that are clearly markup
 * (e.g. a site echoing a full &lt;meta&gt; tag into a field).
 */
export function isUnsafePlaintextSnippet(raw: string): boolean {
  const s = raw.trim();
  if (!s) return true;
  if (/^\s*</.test(s)) return true;
  if (/<\s*meta\b/i.test(s)) return true;
  return false;
}

/** Use OG/Twitter card fields only; order matches typical social-preview precedence. */
export function pickDescription(ogResult: Record<string, unknown> | undefined): string {
  if (!ogResult) return '';
  const keys = ['ogDescription', 'twitterDescription'] as const;
  for (const key of keys) {
    const val = ogResult[key];
    if (typeof val !== 'string') continue;
    if (isUnsafePlaintextSnippet(val)) continue;
    return he.encode(val);
  }
  return '';
}

async function getOpenGraph(targetUrl: string) {
  try {
    const { result } = await ogs({
      url: targetUrl,
      timeout: 10000,
      onlyGetOpenGraphInfo: true,
    });
    return result as Record<string, unknown> | undefined;
  } catch (error: unknown) {
    const err = error as { result?: { requestUrl?: string; error?: string } };
    console.error(
      `[remark-link-card] Failed Open Graph for ${err?.result?.requestUrl ?? targetUrl}: ${err?.result?.error ?? error}`,
    );
    return undefined;
  }
}

async function downloadImage(url: string, saveDirectory: string): Promise<string | undefined> {
  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
  } catch {
    console.error(`[remark-link-card] Failed to parse url "${url}"`);
    return undefined;
  }
  const filename = sanitize(decodeURI(targetUrl.href));
  const saveFilePath = path.join(saveDirectory, filename);
  try {
    await access(saveFilePath);
    return filename;
  } catch {
    /* fetch */
  }
  try {
    await access(saveDirectory);
  } catch {
    await mkdir(saveDirectory, { recursive: true });
  }
  try {
    const response = await fetch(targetUrl.href, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
      },
    });
    if (!response.ok) throw new Error(String(response.status));
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(saveFilePath, buffer);
  } catch (e) {
    console.error(`[remark-link-card] Failed to download image from ${targetUrl.href}`, e);
    return undefined;
  }
  return filename;
}

export function createDefaultFetcher(options?: RemarkLinkCardOptions): LinkCardFetcher {
  return async (targetUrl: string) => {
    const ogResult = await getOpenGraph(targetUrl);
    const parsedUrl = new URL(targetUrl);
    const title =
      (typeof ogResult?.ogTitle === 'string' && he.encode(ogResult.ogTitle)) || parsedUrl.hostname;
    const description = pickDescription(ogResult);

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}`;
    let faviconSrc = '';
    if (options?.cache) {
      const faviconFilename = await downloadImage(
        faviconUrl,
        path.join(process.cwd(), defaultSaveDirectory, defaultOutputDirectory),
      );
      faviconSrc = faviconFilename
        ? path.join(defaultOutputDirectory, faviconFilename)
        : faviconUrl;
    } else {
      faviconSrc = faviconUrl;
    }

    let ogImageSrc = '';
    const ogImage = ogResult?.ogImage as { url?: string; alt?: string } | undefined;
    if (ogImage?.url) {
      if (options?.cache) {
        const imageFilename = await downloadImage(
          ogImage.url,
          path.join(process.cwd(), defaultSaveDirectory, defaultOutputDirectory),
        );
        ogImageSrc = imageFilename ? path.join(defaultOutputDirectory, imageFilename) : ogImage.url;
      } else {
        ogImageSrc = ogImage.url;
      }
    }

    const ogImageAlt = (typeof ogImage?.alt === 'string' && he.encode(ogImage.alt)) || title;

    let displayUrl = options?.shortenUrl ? parsedUrl.hostname : targetUrl;
    try {
      displayUrl = decodeURI(displayUrl);
    } catch {
      console.error(`[remark-link-card] Cannot decode url: "${displayUrl}"`);
    }

    return {
      title,
      description,
      faviconSrc,
      ogImageSrc,
      ogImageAlt,
      displayUrl,
      url: targetUrl,
    };
  };
}

export function createLinkCard(data: LinkCardData) {
  const faviconElement = data.faviconSrc
    ? `<img class="rlc-favicon" src="${data.faviconSrc}" alt="${data.title} favicon" width="16" height="16">`.trim()
    : '';

  const descriptionElement = data.description
    ? `<div class="rlc-description">${data.description}</div>`
    : '';

  const imageElement = data.ogImageSrc
    ? `<div class="rlc-image-container">
      <img class="rlc-image" src="${data.ogImageSrc}" alt="${data.ogImageAlt}" />
    </div>`.trim()
    : '';

  return `
<a class="rlc-container" href="${data.url}">
  <div class="rlc-info">
    <div class="rlc-title">${data.title}</div>
    ${descriptionElement}
    <div class="rlc-url-container">
      ${faviconElement}
      <span class="rlc-url">${data.displayUrl}</span>
    </div>
  </div>
  ${imageElement}
</a>
`.trim();
}

type ParentWithChildren = { children: Root['children'] };

export default function remarkLinkCard(
  options?: RemarkLinkCardOptions & { fetcher?: LinkCardFetcher },
) {
  const fetch = options?.fetcher ?? createDefaultFetcher(options);
  return async (tree: Root) => {
    const tasks: Array<{ index: number; parent: ParentWithChildren; url: string }> = [];

    visit(tree, 'paragraph', (paragraphNode, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      const p = paragraphNode as Paragraph;
      if (p.children.length !== 1) return;
      if (p.data !== undefined) return;

      visit(p, 'text', (textNode) => {
        const urls = textNode.value.match(/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/g);
        if (urls && urls.length === 1) {
          tasks.push({ index, parent: parent as ParentWithChildren, url: urls[0] });
        }
      });
    });

    const byParent = new Map<ParentWithChildren, typeof tasks>();
    for (const t of tasks) {
      const list = byParent.get(t.parent) ?? [];
      list.push(t);
      byParent.set(t.parent, list);
    }

    try {
      for (const list of byParent.values()) {
        list.sort((a, b) => b.index - a.index);
        for (const { index, parent, url } of list) {
          const data = await fetch(url);
          parent.children.splice(index, 1, { type: 'html', value: createLinkCard(data) });
        }
      }
    } catch (error) {
      console.error(`[remark-link-card] Error: ${error}`);
    }

    return tree;
  };
}
