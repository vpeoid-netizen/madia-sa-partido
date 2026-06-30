#!/usr/bin/env node
import { chmodSync, existsSync, lstatSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const targets = [
  join(root, 'node_modules/.bin'),
  join(root, '.tools/node/bin'),
];

for (const dir of targets) {
  if (!existsSync(dir)) continue;
  for (const name of ['next', 'node', 'npm', 'npx']) {
    const file = join(dir, name);
    if (!existsSync(file)) continue;
    try {
      chmodSync(file, 0o755);
    } catch {
      // Google Drive may block chmod; dev:direct still works.
    }
  }
}

const workspaceLinks = {
  ai: '../../packages/ai',
  domain: '../../packages/domain',
  importers: '../../packages/importers',
  maps: '../../packages/maps',
  ui: '../../packages/ui',
  web: '../../apps/web',
};

const madiaDir = join(root, 'node_modules/@madia');
if (existsSync(madiaDir)) {
  for (const [name, target] of Object.entries(workspaceLinks)) {
    const linkPath = join(madiaDir, name);
    if (!existsSync(linkPath)) continue;
    try {
      const stat = lstatSync(linkPath);
      if (stat.isSymbolicLink()) continue;
      const text = readFileSync(linkPath, 'utf8').trim();
      rmSync(linkPath);
      symlinkSync(text || target, linkPath);
    } catch {
      try {
        rmSync(linkPath, { force: true });
        symlinkSync(target, linkPath);
      } catch {
        // Drive may block symlinks.
      }
    }
  }
}

console.log('Permission and workspace link fix attempted.');
console.log('If npm run dev still fails, run from madia-platform: npm run dev:direct');
