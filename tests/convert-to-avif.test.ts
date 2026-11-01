import { randomUUID } from 'node:crypto';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import { assert, test } from './harness';

test('image conversion keeps or removes originals as requested', async () => {
  const inputDir = mkdtempSync(join(tmpdir(), 'blog-avif-'));
  const slug = `avif-test-${randomUUID()}`;
  const outputDir = join('public', 'posts', slug);
  const input = join(inputDir, 'Sample Image.png');

  try {
    await sharp({ create: { width: 4, height: 4, channels: 3, background: '#123456' } })
      .png()
      .toFile(input);

    const kept = spawnSync(process.execPath, [
      'scripts/convert-to-avif.mjs',
      input,
      slug,
      '--keep',
    ]);
    assert(kept.status === 0, `conversion with --keep failed: ${kept.stderr}`);
    assert(existsSync(input), 'original must remain with --keep');
    const output = join(outputDir, `${slug}-sample-image.avif`);
    assert(
      (await sharp(output).metadata()).mediaType === 'image/avif',
      'output must be an AVIF image',
    );

    const removed = spawnSync(process.execPath, ['scripts/convert-to-avif.mjs', input, slug]);
    assert(removed.status === 0, `conversion without --keep failed: ${removed.stderr}`);
    assert(!existsSync(input), 'original must be removed after conversion');

    const invalid = join(inputDir, 'invalid.png');
    writeFileSync(invalid, 'not an image');
    const failed = spawnSync(process.execPath, ['scripts/convert-to-avif.mjs', invalid, slug]);
    assert(failed.status === 1, 'invalid input must fail');
    assert(existsSync(invalid), 'original must remain after a failed conversion');
  } finally {
    rmSync(inputDir, { recursive: true, force: true });
    rmSync(outputDir, { recursive: true, force: true });
  }
});
