#!/usr/bin/env node
/**
 * Historical migration (May 2026): messy `public/posts/**` names → kebab-case slugs + markdown path sync.
 * Safe to delete once merged; re-running skips missing sources (idempotent).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(fileURLToPath(new URL('.', import.meta.url)), '..');
const publicPosts = path.join(root, 'public/posts');

const renames = [
  // clouds-in-super-mario
  ['clouds-in-super-mario/Super_Mario_Clouds.avif', 'clouds-in-super-mario/super-mario-clouds.avif'],
  ['clouds-in-super-mario/Super_Mario_Level_1.avif', 'clouds-in-super-mario/super-mario-bros-world-1-1.avif'],
  ['clouds-in-super-mario/Super_Mario_Tile_Map.avif', 'clouds-in-super-mario/super-mario-bros-tile-map.avif'],
  // coverview
  ['coverview-blog-cover-generator/SCR-20220506-pjp.avif', 'coverview-blog-cover-generator/coverview-color-picker.avif'],
  // fedex
  ['fedex-stole-package-banned-account/1714553672877.avif', 'fedex-stole-package-banned-account/fedex-tracking-screenshot.avif'],
  ['fedex-stole-package-banned-account/c8a13cb7-b024-471b-9c01-0b20d6819199.avif', 'fedex-stole-package-banned-account/fedex-mac-studio-arrival.avif'],
  ['fedex-stole-package-banned-account/3710_Forbes_Ave.avif', 'fedex-stole-package-banned-account/fedex-forbes-ave-address.avif'],
  ['fedex-stole-package-banned-account/Exception_Reason.avif', 'fedex-stole-package-banned-account/fedex-exception-detail.avif'],
  ['fedex-stole-package-banned-account/e35c98f5-1ae6-460e-bcab-396f8e76cbd2.avif', 'fedex-stole-package-banned-account/fedex-support-chat-1.avif'],
  ['fedex-stole-package-banned-account/e9388dd3-0f3c-4cd0-9579-5c7955df5a0d.avif', 'fedex-stole-package-banned-account/fedex-support-chat-2.avif'],
  // canada banking
  ['canada-international-student-banking-guide-2023/EQ_Bank_Card.avif', 'canada-international-student-banking-guide-2023/canada-eq-bank-card.avif'],
  [
    'canada-international-student-banking-guide-2023/TD_Cash_Back_Visa_Infinite_Card.avif',
    'canada-international-student-banking-guide-2023/canada-td-cash-back-visa-infinite.avif'
  ],
  // spy-x
  [
    'spy-x-family-review/9f61396712ba4244e029d0646e1420fdea90567b-1277x716.avif',
    'spy-x-family-review/spy-x-family-still.avif'
  ],
  // fsnotes (avoid macOS case-insensitive FS clash: macOS-and-iOS vs macos-and-ios)
  ['fsnotes-apple-ecosystem-notes/macOS-and-iOS.avif', 'fsnotes-apple-ecosystem-notes/fsnotes-macos-ios.avif'],
  ['fsnotes-apple-ecosystem-notes/backup-backup.avif', 'fsnotes-apple-ecosystem-notes/fsnotes-backup-nested-dialog.avif'],
  // toilet
  ['toilet-dilemma/toiletbanner1.avif', 'toilet-dilemma/toilet-dilemma-banner.avif']
];

const bonify = ['0941', '0942', '0943', '0944', '0945', '0946', '0947', '0948', '0949', '0950'];
bonify.forEach((n, i) => {
  const pad = String(i + 1).padStart(2, '0');
  renames.push([`bonify/IMG_${n}.avif`, `bonify/bonify-screen-${pad}.avif`]);
});

const fiat = ['0763', '0764', '0765', '0766', '0767', '0768', '0769', '0770', '0771', '0772'];
fiat.forEach((n, i) => {
  const pad = String(i + 1).padStart(2, '0');
  renames.push([`fiat24/IMG_${n}.avif`, `fiat24/fiat24-screen-${pad}.avif`]);
});

['0839', '0840', '0841'].forEach((n, i) => {
  const pad = String(i + 1).padStart(2, '0');
  renames.push([`barclays/IMG_${n}.avif`, `barclays/barclays-screen-${pad}.avif`]);
});

const mazaOrder = [
  '0788',
  '0789',
  '0790',
  '0791',
  '0792',
  '0793',
  '0794',
  '0795',
  '0797',
  '0798',
  '0799',
  '0800',
  '0801',
  '0802',
  '0803',
  '0804',
  '0805',
  '0806',
  '0807',
  '0808',
  '0809',
  '0810',
  '0811',
  '0812',
  '0813',
  '0814',
  '0815',
  '0816',
  '0819',
  '0824',
  '0826',
  '0827'
];
mazaOrder.forEach((n, i) => {
  const pad = String(i + 1).padStart(2, '0');
  renames.push([`maza/IMG_${n}.avif`, `maza/maza-screen-${pad}.avif`]);
});

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
    fs.mkdirSync(path.dirname(b), { recursive: true });
    fs.renameSync(a, b);
    console.log('renamed', from, '->', to);
  }
}

function replaceInRepo() {
  const pathReplacements = [
    ...renames.map(([from, to]) => [`/posts/${from}`, `/posts/${to}`]),
    [
      '/posts/my-referral-codes/Screenshot_2023-03-15_at_06.22.16.avif',
      '/posts/my-referral-codes/my-referral-codes-list.avif'
    ]
  ];

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

  const files = walk(root);

  for (const file of files) {
    if (file.endsWith('rename-post-assets.mjs')) continue;
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
