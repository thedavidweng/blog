import { bindings, defineConfig } from 'cf/config';

export default defineConfig({
  worker: {
    name: 'blog',
    compatibilityDate: '2026-05-01',
    compatibilityFlags: ['nodejs_compat'],
    workersDev: true,
    entrypoint: '../src/worker.ts',
    domains: ['blog.blahaj.uk', 'blog.davidweng.eu.org'],
    assets: { runWorkerFirst: true, htmlHandling: 'auto-trailing-slash', notFoundHandling: '404-page' },
    env: { ASSETS: bindings.assets() },
  },
});
