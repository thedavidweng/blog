import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '../public');

const BANNED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);

const WHITELIST = [
  'favicon',
  'apple-touch-icon',
  'android-chrome',
  // Social-media crawlers don't reliably decode AVIF; OG images stay PNG/JPG.
  'og/',
  'logo',
];

function isWhitelisted(filePath) {
  const relativePath = path.relative(PUBLIC_DIR, filePath);
  return WHITELIST.some((pattern) => relativePath.includes(pattern));
}

function scanDirectory(dir) {
  let violations = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      violations = violations.concat(scanDirectory(fullPath));
    } else {
      const ext = path.extname(file).toLowerCase();

      if (BANNED_EXTENSIONS.has(ext)) {
        if (!isWhitelisted(fullPath)) {
          violations.push(path.relative(PUBLIC_DIR, fullPath));
        }
      }
    }
  }

  return violations;
}

console.log('🔍 Scanning public directory for unoptimized image formats...');
const violations = scanDirectory(PUBLIC_DIR);

if (violations.length > 0) {
  console.error('\n❌ ERROR: Found images that are not in .avif format or SVG!');
  console.error(
    'To keep the Git repository lightweight, all content images must be highly compressed AVIFs.',
  );
  console.error('Please convert the following files to .avif and delete the originals:\n');

  violations.forEach((v) => console.error(`   - ${v}`));

  console.error(
    '\n(Note: If these files are required for browser/system compatibility like favicons or OG cards, add their folder/name to the WHITELIST in scripts/check-image-formats.js)',
  );
  process.exit(1);
} else {
  console.log('✅ Success: All content images are optimally formatted or properly whitelisted!');
  process.exit(0);
}
