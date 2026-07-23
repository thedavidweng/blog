import type { OgObject } from 'open-graph-scraper/types';
import ogs from 'open-graph-scraper';
import { visit } from 'unist-util-visit';
import type { Paragraph, Root } from 'mdast';

export type RemarkLinkCardOptions = {
  shortenUrl?: boolean;
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

/** Escape the five significant XML characters for safe insertion into HTML text. */
function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
export function pickDescription(ogResult: OgObject | undefined): string {
  if (!ogResult) return '';
  const keys = ['ogDescription', 'twitterDescription'] as const;
  for (const key of keys) {
    const val = ogResult[key];
    if (typeof val !== 'string') continue;
    if (isUnsafePlaintextSnippet(val)) continue;
    return escapeHtml(val);
  }
  return '';
}

async function getOpenGraph(targetUrl: string) {
  try {
    const { result, error } = await ogs({
      url: targetUrl,
      timeout: 10000,
      onlyGetOpenGraphInfo: true,
    });
    if (error) return undefined;
    return result;
  } catch (error: unknown) {
    console.error(`[remark-link-card] Failed Open Graph for ${targetUrl}: ${error}`);
    return undefined;
  }
}

export function createDefaultFetcher(options?: RemarkLinkCardOptions): LinkCardFetcher {
  return async (targetUrl: string) => {
    const ogResult = await getOpenGraph(targetUrl);
    const parsedUrl = new URL(targetUrl);
    const title =
      (typeof ogResult?.ogTitle === 'string' && escapeHtml(ogResult.ogTitle)) || parsedUrl.hostname;
    const description = pickDescription(ogResult);

    const faviconSrc = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}`;

    let ogImageSrc = '';
    const ogImage = ogResult?.ogImage?.[0];
    if (ogImage?.url) {
      ogImageSrc = ogImage.url;
    }

    const ogImageAlt = (typeof ogImage?.alt === 'string' && escapeHtml(ogImage.alt)) || title;

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
  const fetcher = options?.fetcher ?? createDefaultFetcher(options);
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

    const allTasks = [...byParent.values()].flat();
    const results = await Promise.allSettled(allTasks.map((t) => fetcher(t.url)));
    const dataByTask = new Map<typeof allTasks[number], LinkCardData>();
    for (let i = 0; i < allTasks.length; i++) {
      const r = results[i];
      if (r?.status === 'fulfilled') {
        dataByTask.set(allTasks[i]!, r.value);
      } else if (r?.status === 'rejected') {
        console.error(`[remark-link-card] Failed to fetch ${allTasks[i]!.url}: ${r.reason}`);
      }
    }
    for (const list of byParent.values()) {
      list.sort((a, b) => b.index - a.index);
      for (const task of list) {
        const data = dataByTask.get(task);
        if (!data) continue;
        task.parent.children.splice(task.index, 1, { type: 'html', value: createLinkCard(data) });
      }
    }

    return tree;
  };
}
