#!/usr/bin/env node
/**
 * Easy GitHub upload for MADIA — run: npm run deploy:github
 */
import { createInterface } from 'node:readline/promises';
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_REPO = 'madia-sa-partido';

function run(cmd, options = {}) {
  return spawnSync(cmd, { shell: true, cwd: ROOT, stdio: 'inherit', ...options });
}

function runCapture(cmd) {
  return spawnSync(cmd, { shell: true, cwd: ROOT, encoding: 'utf8' });
}

function hasGh() {
  return runCapture('command -v gh').status === 0;
}

function ghAuthed() {
  if (!hasGh()) return false;
  const result = runCapture('gh auth status');
  return result.status === 0;
}

function stripPackageJsonBom() {
  const packagePath = join(ROOT, 'package.json');
  if (!existsSync(packagePath)) return;
  let text = readFileSync(packagePath, 'utf8');
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
    writeFileSync(packagePath, text);
    console.log('Fixed package.json encoding.');
  }
}

function ensureGitRepo() {
  if (!existsSync(join(ROOT, '.git'))) {
    console.log('Creating git repository...');
    run('git init');
    run('git branch -M main');
  }
}

function removeGithubWorkflows() {
  const workflowPath = join(ROOT, '.github', 'workflows');
  if (!existsSync(workflowPath)) return;
  run('git rm -r --cached .github/workflows 2>/dev/null || rm -rf .github/workflows');
}

function ensureCommit() {
  removeGithubWorkflows();
  const status = runCapture('git status --porcelain');
  if (!status.stdout.trim()) {
    console.log('No new changes to commit.');
    return;
  }
  run('git add .');
  run('git commit -m "Update MADIA platform"');
}

async function askQuestions() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log('\nMADIA — Easy GitHub upload\n');
    console.log('Tip: your GitHub username is in the top-right menu at github.com\n');

    const username = (await rl.question('Your GitHub username: ')).trim();
    if (!username || username.includes('YOUR_')) {
      throw new Error('Please enter your real GitHub username.');
    }

    const repoInput = (await rl.question(`Repository name [${DEFAULT_REPO}]: `)).trim();
    const repo = repoInput || DEFAULT_REPO;

    return { username, repo };
  } finally {
    rl.close();
  }
}

async function main() {
  stripPackageJsonBom();
  ensureGitRepo();

  const { username, repo } = await askQuestions();
  const remoteUrl = `https://github.com/${username}/${repo}.git`;

  console.log(`\nTarget: ${remoteUrl}\n`);

  const remoteCheck = runCapture('git remote get-url origin 2>/dev/null');
  if (remoteCheck.stdout.includes('YOUR_USERNAME')) {
    run('git remote remove origin');
  }
  if (remoteCheck.status !== 0) {
    run(`git remote add origin ${remoteUrl}`);
  }

  run(`git remote set-url origin ${remoteUrl}`);

  ensureCommit();

  if (!hasGh()) {
    console.log('Uploading with git (no extra tools needed)...\n');
    console.log('When Terminal asks for a password, use a GitHub token — NOT your Mac password.');
    console.log('Create one here (takes 1 minute):');
    console.log('  https://github.com/settings/tokens/new?scopes=repo&description=MADIA-upload\n');
    console.log('On that page: click "Generate token" → copy the token (starts with ghp_)\n');
    console.log('  Username: ' + username);
    console.log('  Password: paste the token\n');
  } else {
    if (!ghAuthed()) {
      console.log('Opening GitHub sign-in...');
      run('gh auth login -h github.com -p https -w');
    }
    const view = runCapture(`gh repo view ${username}/${repo} --json url 2>/dev/null`);
    if (view.status !== 0) {
      console.log(`Creating GitHub repository ${username}/${repo}...`);
      run(
        `gh repo create ${repo} --public --source=. --remote=origin --description "MADIA sa Partido tourism platform"`,
      );
      run(`git remote set-url origin ${remoteUrl}`);
    }
    console.log('\nUploading to GitHub...\n');
  }

  const push = run('git push -u origin main');
  if (push.status !== 0) {
    console.log('\nIf push failed, try:');
    console.log(`  git remote set-url origin ${remoteUrl}`);
    console.log('  git push -u origin main\n');
    process.exit(1);
  }

  console.log('\nDone! Your code is on GitHub:');
  console.log(`  https://github.com/${username}/${repo}\n`);
  console.log('Next — deploy free on Vercel:');
  console.log('  1. Go to https://vercel.com and sign in with GitHub');
  console.log('  2. Import this repository');
  console.log('  3. Root Directory: apps/web  (Vercel reads vercel.json automatically)');
  console.log('  4. Click Deploy\n');
}

main().catch((error) => {
  console.error('\n' + error.message + '\n');
  process.exit(1);
});
