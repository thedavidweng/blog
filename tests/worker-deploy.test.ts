import config from '../deploy/cloudflare.config.ts';
import { assert, test } from './harness';

test('cf keeps the markdown Worker in front of static assets', () => {
  const worker = config.worker;
  assert(worker, 'cloudflare.config.ts must define a Worker');
  assert(worker.entrypoint === '../src/worker.ts', 'entrypoint must stay src/worker.ts');
  assert(worker.assets?.runWorkerFirst === true, 'runWorkerFirst must stay true');
  assert(worker.name === 'blog', 'worker name must stay blog');
  assert(
    worker.assets?.htmlHandling === 'auto-trailing-slash',
    'html handling must stay auto-trailing-slash',
  );
  assert(worker.assets?.notFoundHandling === '404-page', 'missing assets must stay a 404 page');
});
