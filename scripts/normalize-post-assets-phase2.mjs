#!/usr/bin/env node
/**
 * Phase 2: kamen-rider kr- prefix, FSNotes fsnotes- prefix, coverview/safepal samples.
 * Run from repo root: node scripts/normalize-post-assets-phase2.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(fileURLToPath(new URL('.', import.meta.url)), '..');
const publicPosts = path.join(root, 'public/posts');

const renames = [];

// CoverView — vague name
renames.push([
  'coverview-blog-cover-generator/cover.avif',
  'coverview-blog-cover-generator/coverview-sample-cover.avif'
]);

// SafePal
renames.push([
  'safepal-x1-free-hardware-wallet/order-page.avif',
  'safepal-x1-free-hardware-wallet/safepal-x1-order-page.avif'
]);
renames.push([
  'safepal-x1-free-hardware-wallet/verification.avif',
  'safepal-x1-free-hardware-wallet/safepal-x1-verification.avif'
]);

// FSNotes — unify fsnotes- prefix (avoid bare git-*.avif / view-options.avif)
const fsnotesBare = [
  ['view-options.avif', 'fsnotes-view-options.avif'],
  ['preferences.avif', 'fsnotes-preferences.avif'],
  ['tag-autocomplete.avif', 'fsnotes-tag-autocomplete.avif'],
  ['git-save.avif', 'fsnotes-git-save.avif'],
  ['git-commit-dialog.avif', 'fsnotes-git-commit-dialog.avif'],
  ['git-history.avif', 'fsnotes-git-history.avif'],
  ['backup-settings.avif', 'fsnotes-backup-settings.avif'],
  ['image-toolbar.avif', 'fsnotes-image-toolbar.avif']
];
for (const [a, b] of fsnotesBare) {
  renames.push([`fsnotes-apple-ecosystem-notes/${a}`, `fsnotes-apple-ecosystem-notes/${b}`]);
}

// Kamen Rider — kr- prefix on basename (folder slug unchanged)
const krMap = [
  ['reference-the-series-costume.avif', 'kr-ref-the-series-costume.avif'],
  ['reference-shin-film-costume.avif', 'kr-ref-shin-film-costume.avif'],
  ['forgotten-135-fit-01.avif', 'kr-forgotten-135-fit-01.avif'],
  ['forgotten-135-fit-02.avif', 'kr-forgotten-135-fit-02.avif'],
  ['forgotten-135-fit-03.avif', 'kr-forgotten-135-fit-03.avif'],
  ['forgotten-135-fit-04.avif', 'kr-forgotten-135-fit-04.avif'],
  ['forgotten-135-shopping-collage.avif', 'kr-forgotten-135-shopping-collage.avif'],
  ['shilinlian-full-costume.avif', 'kr-shilinlian-full-costume.avif'],
  ['shilinlian-shopping-list-01.avif', 'kr-shilinlian-shopping-list-01.avif'],
  ['shilinlian-shopping-list-02.avif', 'kr-shilinlian-shopping-list-02.avif'],
  ['et-yonghengheng-fit-01.avif', 'kr-et-yonghengheng-fit-01.avif'],
  ['et-yonghengheng-fit-second-angle.avif', 'kr-et-yonghengheng-fit-second-angle.avif'],
  ['et-yonghengheng-shopping-01.avif', 'kr-et-yonghengheng-shopping-01.avif'],
  ['et-yonghengheng-shopping-02.avif', 'kr-et-yonghengheng-shopping-02.avif'],
  ['et-yonghengheng-shopping-03.avif', 'kr-et-yonghengheng-shopping-03.avif'],
  ['wo-chao-bing-training-suit-fit.avif', 'kr-wo-chao-bing-training-suit-fit.avif'],
  ['wo-chao-bing-shopping-01.avif', 'kr-wo-chao-bing-shopping-01.avif'],
  ['wo-chao-bing-shopping-02.avif', 'kr-wo-chao-bing-shopping-02.avif'],
  ['xizeer-white-fit-01.avif', 'kr-xizeer-white-fit-01.avif'],
  ['xizeer-white-fit-02.avif', 'kr-xizeer-white-fit-02.avif']
];
for (let i = 1; i <= 12; i++) {
  const n = String(i).padStart(2, '0');
  krMap.push([`xizeer-white-shopping-${n}.avif`, `kr-xizeer-white-shopping-${n}.avif`]);
}
for (const [a, b] of krMap) {
  renames.push([`kamen-rider-cosplay-suit-solutions/${a}`, `kamen-rider-cosplay-suit-solutions/${b}`]);
}

function renameFiles() {
  for (const [from, to] of renames) {
    const a = path.join(publicPosts, from);
    const b = path.join(publicPosts, to);
    if (!fs.existsSync(a)) {
      console.warn('skip missing:', from);
      continue;
    }
    if (fs.existsSync(b)) {
      throw new Error(`target exists: ${to}`);
    }
    fs.renameSync(a, b);
    console.log('renamed', from, '->', to);
  }
}

function replaceInRepo() {
  const pathReplacements = renames.map(([from, to]) => [`/posts/${from}`, `/posts/${to}`]);

  const exts = new Set(['.md', '.mdx', '.astro', '.ts', '.tsx', '.js', '.mjs', '.css', '.html', '.json']);
  function walk(dir, out = []) {
    for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
      if (name.name.startsWith('.') && name.name !== '.') continue;
      const p = path.join(dir, name.name);
      if (name.isDirectory()) {
        if (name.name === 'node_modules' || name.name === 'dist' || name.name === '.git') continue;
        walk(p, out);
      } else if (exts.has(path.extname(name.name))) {
        out.push(p);
      }
    }
    return out;
  }

  const files = walk(root).filter((f) => !f.includes('normalize-post-assets-phase2.mjs'));

  for (const file of files) {
    let text = fs.readFileSync(file, 'utf8');
    let changed = false;
    for (const [oldFull, newFull] of pathReplacements) {
      if (text.includes(oldFull)) {
        text = text.split(oldFull).join(newFull);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(file, text, 'utf8');
      console.log('updated', path.relative(root, file));
    }
  }
}

renameFiles();
replaceInRepo();
