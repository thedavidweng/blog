import type { OgObject } from 'open-graph-scraper/types';
import ogs from 'open-graph-scraper';
import { defineMdastPlugin } from 'satteri';

export type LinkCardOptions = {
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
    console.error(`[link-card] Failed Open Graph for ${targetUrl}: ${error}`);
    return undefined;
  }
}

export function createDefaultFetcher(options?: LinkCardOptions): LinkCardFetcher {
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
      console.error(`[link-card] Cannot decode url: "${displayUrl}"`);
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

const URL_PATTERN = /(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/g;

/**
 * A paragraph is a link-card candidate when it has a single child containing exactly one URL.
 * Handles both bare text (pre-autolink) and GFM-autolinked link nodes.
 */
function extractUrlFromParagraph(paragraph: any): string | undefined {
  if (paragraph.data !== undefined) return undefined;
  if (paragraph.children.length !== 1) return undefined;
  const child = paragraph.children[0];
  if (!child) return undefined;

  // GFM autolinks produce a `link` node wrapping a single `text` child.
  if (child.type === 'link' && typeof child.url === 'string') {
    const inner = child.children?.[0];
    if (inner && inner.type === 'text' && typeof inner.value === 'string') {
      if (inner.value === child.url) return child.url;
    }
  }

  // Bare text (no autolinking).
  if (child.type === 'text' && typeof child.value === 'string') {
    const urls = child.value.match(URL_PATTERN);
    if (urls && urls.length === 1) return urls[0];
  }

  return undefined;
}

/**
 * Sätteri MDAST plugin: converts bare-URL paragraphs into rich link cards.
 * Each paragraph is handled independently — the visitor fetches OG data and
 * returns `{ raw }` to splice the card HTML in place.
 */
export const linkCardPlugin = (options?: LinkCardOptions & { fetcher?: LinkCardFetcher }) => {
  const fetcher = options?.fetcher ?? createDefaultFetcher(options);
  return defineMdastPlugin({
    name: 'link-card',
    async paragraph(node) {
      const url = extractUrlFromParagraph(node);
      if (!url) return;
      try {
        const data = await fetcher(url);
        return { raw: createLinkCard(data), mdxExpressions: false };
      } catch (error: unknown) {
        console.error(`[link-card] Failed to fetch ${url}: ${error}`);
      }
    },
  });
};
