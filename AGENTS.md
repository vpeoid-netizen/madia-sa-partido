# MADIA sa Partido — Agent Implementation Guide

Canonical instructions for any coding agent continuing this repository.

## Product

MADIA sa Partido is a production tourism platform for the ten municipalities of the Partido Area (Fourth Legislative District, Camarines Sur, Philippines). Currency: PHP. Timezone: `Asia/Manila`.

## Repository layout

- `apps/web` — Next.js 15 App Router (primary release)
- `apps/mobile` — Expo shell (parity work in Phase 9)
- `packages/domain` — entities, validation, search, budget
- `packages/ui` — design tokens
- `packages/maps` — MapLibre helpers, GeoJSON types
- `packages/ai` — grounded concierge
- `packages/importers` — CSV/JSON import pipeline
- `supabase/migrations` — PostgreSQL + PostGIS schema
- `data/repository` — authoritative MADIA research CSV/JSON inputs
- `data/cache/madia-runtime.json` — imported runtime cache (generated)
- `data/local` — file-based persistence for local dev (bookings, favorites, inventory)

## Commands

```bash
npm install
npm run setup          # apply updates, process geojson, import data
npm run dev            # Next.js on :3000
npm run build
npm run test
npm run lint
npm run import:data
npm run import:dry-run
npm run process:geojson
```

Node.js 20+ required. Detect package manager from `package-lock.json` (npm workspaces).

## Conventions

- TypeScript strict mode; Zod for validation
- Server Components by default; `'use client'` only for interactivity
- No hard-coded secrets; use `.env` (see `.env.example`)
- No fabricated tourism records — use imported MADIA data or polished empty states
- Public pages must not show internal workflow labels (verification status, confidence, draft, etc.)
- Display typography: Manrope (UI) + Cormorant Garamond (display). Do not use BARABARA.
- Only `published` / publicly eligible media in carousel and galleries
- External providers behind adapters (Supabase, AI, payments)

## Persistence

- **Production:** Supabase PostgreSQL + RLS + storage
- **Local dev without Supabase:** `data/local/*.json` file store via `apps/web/src/lib/persistence.ts`
- **Runtime tourism data:** `data/cache/madia-runtime.json` from `npm run import:data`

## Implementation order

Follow `TASKS.md` and the master build spec phases. Current milestone: **Phase 1–2 vertical slice** (carousel → destination → save → related listings → booking test payment → AI → map).

## Completion rules

A feature is complete only when UI, validation, authorization, persistence, error handling, and tests work together. Update `BUILD_STATUS.md` after each substantial session. Do not claim tests passed unless executed.

## Key routes

- `/` — destination carousel + homepage sections
- `/map` — interactive Partido municipality map
- `/explore` — search
- `/municipalities/[slug]` — municipality profile
- `/municipalities/[slug]/[placeSlug]` — place detail
- `/trips` — saved trips
- `/ai` — tourism assistant
- `/book` — accommodation booking checkout
