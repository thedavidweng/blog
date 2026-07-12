#!/usr/bin/env node
/**
 * IndexNow Submit Script
 *
 * Submits URLs to Bing's IndexNow API for faster indexing.
 * This script is automatically called after build by the Cloudflare Pages hook,
 * or can be run manually.
 *
 * Setup:
 * 1. Register at https://www.bing.com/indexnow
 * 2. Set your key in environment variable INDEXNOW_KEY (or edit the key below)
 * 3. Set your site URL in environment variable INDEXNOW_URL (or edit below)
 * 4. Run: node scripts/submit-indexnow.mjs
 *
 * For Cloudflare Pages, add this as a Build hook or post-processing script.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Configuration
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'YOUR_INDEXNOW_KEY_HERE';
const SITE_URL = process.env.INDEXNOW_URL || 'https://thedavidweng.github.io';
const BING_API = 'https://www.bing.com/indexnow';

async function getAllUrls() {
  const urls = new Set();

  // Add base URLs
  urls.add(SITE_URL + '/');
  urls.add(SITE_URL + '/posts/');
  urls.add(SITE_URL + '/tags/');
  urls.add(SITE_URL + '/about/');

  // Read sitemap
  const sitemapPath = join(rootDir, 'public', 'sitemap-index.xml');

  try {
    const sitemap = readFileSync(sitemapPath, 'utf-8');

    // Extract URLs from sitemap
    const urlMatches = sitemap.match(/<loc>([^<]+)<\/loc>/g);
    if (urlMatches) {
      urlMatches.forEach((match) => {
        const url = match.replace(/<\/?loc>/g, '');
        urls.add(url);
      });
    }
  } catch (e) {
    console.log('Sitemap not found, using base URLs only');
  }

  return Array.from(urls);
}

async function submitToIndexNow(urls) {
  if (INDEXNOW_KEY === 'YOUR_INDEXNOW_KEY_HERE') {
    console.log('⚠️  IndexNow key not configured. Set INDEXNOW_KEY environment variable.');
    console.log('   Visit https://www.bing.com/indexnow to register and get your key.');
    console.log('');
    console.log('   URLs that would be submitted:');
    urls.forEach((url) => console.log('   - ' + url));
    return;
  }

  const payload = {
    host: new URL(SITE_URL).hostname,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/.well-known/indexnow-key.txt`,
    urlList: urls,
  };

  console.log(`Submitting ${urls.length} URLs to IndexNow...`);

  try {
    const response = await fetch(BING_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('✅ Successfully submitted to IndexNow');
      console.log(`   ${urls.length} URLs indexed`);
    } else {
      console.log(`⚠️  IndexNow returned status: ${response.status}`);
      const text = await response.text();
      console.log(`   Response: ${text}`);
    }
  } catch (error) {
    console.error('❌ Failed to submit to IndexNow:', error.message);
  }
}

// Main
const urls = await getAllUrls();
console.log(`Found ${urls.length} URLs to submit`);
await submitToIndexNow(urls);
