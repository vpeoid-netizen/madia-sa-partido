# Deploy MADIA (easy way)

## 1. Upload to GitHub (one command)

Open **Terminal** and run:

```bash
cd "/Users/kiergasga/Library/CloudStorage/GoogleDrive-vpeoid@parsu.edu.ph/My Drive/MADIA sa Partido – Tourism Data Repository/madia-platform"

npm run deploy:github
```

It will ask for your **GitHub username** only. Everything else is automatic.

First time only — when Terminal asks for a **password**, paste a GitHub token (not your Mac password):

1. Open [github.com/settings/tokens/new](https://github.com/settings/tokens/new?scopes=repo&description=MADIA-upload)
2. Check **repo** only → **Generate token** → copy it (starts with `ghp_`)
3. Username: your GitHub name · Password: paste the token

If push says **"workflow scope"**, run `npm run deploy:github` again — the script no longer uploads GitHub Actions files (Vercel handles deploy).

Optional — install GitHub login tool:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install gh
```

Then run `npm run deploy:github` again.

---

## 2. Deploy on Vercel (click only)

1. Open [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. **Add New → Project** → pick your `madia-sa-partido` repo
3. Set **Root Directory** to: `apps/web`
4. Click **Deploy** (settings are already in `vercel.json`)

**Live site (current production):** [madia-sa-partido-aa-sigma.vercel.app](https://madia-sa-partido-aa-sigma.vercel.app)

If an older Vercel project named `madia-sa-partido` fails to build, open **Project Settings → General** and set:

| Setting | Value |
|---------|--------|
| Root Directory | `apps/web` |
| Install Command | `cd ../.. && npm install --include-workspace-root` |
| Build Command | `cd ../.. && npm run import:data && npm run build --workspace=@madia/domain --workspace=@madia/ai --workspace=@madia/maps --workspace=@madia/ui && npm run build --workspace=@madia/web` |

Or run once after `npx vercel login`:

```bash
node scripts/fix-vercel-main-project.mjs
```

A wrong Root Directory (`.` instead of `apps/web`) causes `npm install` to fail and blocks deploys.

---

## 3. Optional — AI on the live site

Local Ollama does not run on Vercel. In Vercel → **Settings → Environment Variables**, add a free key:

- `AI_PROVIDER` = `auto`
- `GROQ_API_KEY` = your key from [console.groq.com](https://console.groq.com)

Or leave blank — the site still works with grounded MADIA answers.

---

## Update later

```bash
npm run deploy:github
```

Vercel redeploys automatically after each push.
