#!/usr/bin/env node
/**
 * Align the main Vercel project with apps/web/vercel.json settings.
 * Run after: npx vercel login
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const PROJECT_ID = 'prj_bFc1xuIpxqA63gxKqSA5YmuFBc7t';
const AUTH_PATH = join(homedir(), '.local/share/com.vercel.cli/auth.json');

const token = JSON.parse(readFileSync(AUTH_PATH, 'utf8')).token;
const body = {
  rootDirectory: 'apps/web',
  installCommand: 'cd ../.. && npm install --include-workspace-root',
  buildCommand:
    'cd ../.. && npm run import:data && npm run build --workspace=@madia/domain --workspace=@madia/ai --workspace=@madia/maps --workspace=@madia/ui && npm run build --workspace=@madia/web',
  framework: 'nextjs',
};

const res = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}`, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

const data = await res.json();
if (!res.ok) {
  console.error('Failed to update Vercel project:', data);
  process.exit(1);
}

console.log('Updated madia-sa-partido project settings:');
console.log('  rootDirectory:', data.rootDirectory);
console.log('  installCommand:', data.installCommand);
console.log('  buildCommand:', data.buildCommand?.slice(0, 60) + '...');
