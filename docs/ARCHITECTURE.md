# Architecture

## Overview

MADIA sa Partido is a TypeScript monorepo:

- **Web (Next.js App Router)** — map-first PWA, API routes, grounded AI
- **Mobile (Expo)** — shared backend shell
- **Supabase** — auth, PostgreSQL + PostGIS, storage, RLS
- **Packages** — domain logic, importers, maps, AI, UI tokens

## Data flow

1. Approved repository files in `data/repository/`
2. `scripts/import-runtime.mjs` validates and writes `data/cache/madia-runtime.json`
3. GeoJSON processor subsets PSA/NAMRIA-based boundaries into `data/geojson/`
4. Web API routes read runtime cache (local dev) or Supabase (production)
5. Future imports create versioned `import_batches` with merge rules

## Security

- AI and service keys server-side only
- RLS on municipalities, places, media, trips
- Restricted photos never exposed in public SELECT policies

## Timezone and currency

Default timezone `Asia/Manila`, currency PHP.
