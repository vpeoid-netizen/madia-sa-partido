#!/usr/bin/env node
/**
 * Start local Ollama for MADIA AI (free, no API key).
 * Usage: node scripts/start-ollama.mjs
 */
import { appendFileSync, createWriteStream, existsSync, openSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OLLAMA_BIN = join(ROOT, '.tools/ollama/ollama');
const LOG_FILE = join(ROOT, '.tools/ollama/ollama.log');
const HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';

async function isRunning() {
  try {
    const res = await fetch(`${HOST}/api/tags`);
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureModel() {
  const tags = await fetch(`${HOST}/api/tags`).then((r) => r.json());
  const hasModel = (tags.models || []).some((m) =>
    String(m.name || '').startsWith(MODEL.split(':')[0]),
  );
  if (hasModel) {
    console.log(`Model ready: ${MODEL}`);
    return;
  }

  console.log(`Pulling ${MODEL} (first run only)...`);
  const res = await fetch(`${HOST}/api/pull`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: MODEL }),
  });

  if (!res.ok) {
    throw new Error(`Failed to pull ${MODEL}`);
  }

  const reader = res.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value).split('\n')) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line);
        if (event.status === 'success') console.log(`Model ready: ${MODEL}`);
      } catch {
        // ignore partial json lines
      }
    }
  }
}

async function ensureBinary() {
  if (existsSync(OLLAMA_BIN)) return;

  const dir = dirname(OLLAMA_BIN);
  const archive = join(dir, 'ollama-darwin.tgz');
  const url = 'https://github.com/ollama/ollama/releases/latest/download/ollama-darwin.tgz';

  console.log('Downloading Ollama for macOS (one-time setup)...');
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to download Ollama');

  await pipeline(res.body, createWriteStream(archive));
  spawnSync('tar', ['-xzf', archive, '-C', dir], { stdio: 'inherit' });
}

async function main() {
  await ensureBinary();

  if (!existsSync(OLLAMA_BIN)) {
    console.error('Ollama binary not found at .tools/ollama/ollama');
    process.exit(1);
  }

  if (await isRunning()) {
    console.log('Ollama already running at', HOST);
  } else {
    console.log('Starting Ollama at', HOST);
    const logFd = openSync(LOG_FILE, 'a');
    const child = spawn(OLLAMA_BIN, ['serve'], {
      detached: true,
      stdio: ['ignore', logFd, logFd],
      env: { ...process.env, OLLAMA_HOST: HOST },
    });
    child.unref();

    for (let i = 0; i < 30; i += 1) {
      if (await isRunning()) break;
      await new Promise((r) => setTimeout(r, 1000));
    }

    if (!(await isRunning())) {
      console.error('Ollama failed to start. Check', LOG_FILE);
      process.exit(1);
    }
    appendFileSync(LOG_FILE, `\n[start-ollama] started at ${new Date().toISOString()}\n`);
    console.log('Ollama started.');
  }

  await ensureModel();
  console.log('MADIA local AI is ready.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
