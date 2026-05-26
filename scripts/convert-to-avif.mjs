#!/usr/bin/env node
/**
 * Convert article images to AVIF with repository-standard parameters.
 *
 * Usage:
 *   pnpm exec tsx scripts/convert-to-avif.mjs <input-path> <slug> [--keep]
 *
 *   <input-path>  Path to an image file or a directory containing images
 *   <slug>        Article slug (e.g., "hello-astro")
 *   --keep        Keep original files after conversion (default: delete)
 *
 * Examples:
 *   pnpm exec tsx scripts/convert-to-avif.mjs ./screenshots/ hello-astro
 *   pnpm exec tsx scripts/convert-to-avif.mjs ./my-screenshot.png hello-astro --keep
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Repository-standard AVIF conversion parameters.
// See docs/image-workflow.md for the rationale.
const AVIF_CONFIG = {
  quality: 65,
  effort: 6,
  chromaSubsampling: '4:2:0',
};

const SUPPORTED_INPUT_FORMATS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff'];

async function loadSharp() {
  let sharpModule;
  try {
    sharpModule = await import('sharp');
  } catch (error) {
    console.error('❌ Failed to load sharp.');
    console.error('   Dependencies may not be installed. Run: pnpm install');
    console.error(`   Underlying error: ${error.message}`);
    process.exit(1);
  }

  // Handle both ESM default export and direct export patterns.
  const sharp = sharpModule.default || sharpModule;
  if (!sharp) {
    console.error('❌ sharp loaded but no export found. Try running pnpm install.');
    process.exit(1);
  }
  return sharp;
}

function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function convertImage(sharp, inputPath, outputPath) {
  await sharp(inputPath).avif(AVIF_CONFIG).toFile(outputPath);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

function printUsage() {
  console.log(`
Usage: pnpm exec tsx scripts/convert-to-avif.mjs <input-path> <slug> [--keep]

  <input-path>   Path to an image file or a directory containing images
  <slug>         Article slug (e.g., "hello-astro")
  --keep         Keep original files after conversion (default: delete)

Examples:
  pnpm exec tsx scripts/convert-to-avif.mjs ./screenshots/ hello-astro
  pnpm exec tsx scripts/convert-to-avif.mjs ./my-screenshot.png hello-astro
  pnpm exec tsx scripts/convert-to-avif.mjs ./screenshots/ hello-astro --keep
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    printUsage();
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  const slug = args[1];
  const keepOriginals = args.includes('--keep');

  if (!slug || slug.includes('/') || slug.includes('\\')) {
    console.error('❌ Invalid slug. Use a simple kebab-case string like "hello-astro".');
    process.exit(1);
  }

  // Validate input path before loading Sharp (better error messages)
  let inputStat;
  try {
    inputStat = fs.statSync(inputPath);
  } catch (err) {
    console.error(`❌ Cannot access input path: ${inputPath}`);
    console.error(`   ${err.message}`);
    process.exit(1);
  }

  const sharp = await loadSharp();

  let filesToConvert = [];

  if (inputStat.isDirectory()) {
    const entries = fs.readdirSync(inputPath);
    filesToConvert = entries
      .map((f) => path.join(inputPath, f))
      .filter((f) => {
        const ext = path.extname(f).toLowerCase();
        return SUPPORTED_INPUT_FORMATS.includes(ext);
      });
    if (filesToConvert.length === 0) {
      console.error(`❌ No supported image files found in ${inputPath}`);
      console.error(`   Supported formats: ${SUPPORTED_INPUT_FORMATS.join(', ')}`);
      process.exit(1);
    }
  } else if (inputStat.isFile()) {
    const ext = path.extname(inputPath).toLowerCase();
    if (!SUPPORTED_INPUT_FORMATS.includes(ext)) {
      console.error(`❌ Unsupported file format: ${ext}`);
      console.error(`   Supported formats: ${SUPPORTED_INPUT_FORMATS.join(', ')}`);
      process.exit(1);
    }
    filesToConvert = [inputPath];
  } else {
    console.error(`❌ Input path is neither a file nor a directory: ${inputPath}`);
    process.exit(1);
  }

  // Create output directory
  const outputDir = path.join(__dirname, '..', 'public', 'posts', slug);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created ${path.relative(process.cwd(), outputDir)}`);
  }

  // Convert each file
  let successCount = 0;
  let failCount = 0;

  for (const filePath of filesToConvert) {
    const basename = path.basename(filePath, path.extname(filePath));
    const safeName = sanitizeFilename(basename);
    const outputName = `${slug}-${safeName}.avif`;
    const outputPath = path.join(outputDir, outputName);

    const inputRelative = path.relative(process.cwd(), filePath);
    const outputRelative = path.relative(process.cwd(), outputPath);

    // Check if output already exists
    if (fs.existsSync(outputPath)) {
      console.log(`⚠️  Overwriting existing file: ${outputRelative}`);
    }

    console.log(`🔄 ${inputRelative} → ${outputRelative}`);

    try {
      await convertImage(sharp, filePath, outputPath);
      const inputSize = fs.statSync(filePath).size;
      const outputSize = fs.statSync(outputPath).size;
      const ratio = ((1 - outputSize / inputSize) * 100).toFixed(1);
      console.log(`   ✅ ${formatBytes(outputSize)} (${ratio}% smaller)`);
      successCount++;

      if (!keepOriginals) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`   ❌ ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n🎉 Done: ${successCount} converted, ${failCount} failed.`);
  console.log(`   Output: public/posts/${slug}/`);

  if (!keepOriginals && successCount > 0) {
    console.log('   Original files were deleted. Use --keep to preserve them.');
  }

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
