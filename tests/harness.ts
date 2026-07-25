export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

let passed = 0;
let failed = 0;

export async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    failed++;
    console.error(`  FAIL  ${name}`);
    console.error(`        ${e}`);
  }
}

export function summarize() {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}
