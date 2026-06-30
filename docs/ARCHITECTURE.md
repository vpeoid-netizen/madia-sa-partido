# MADIA Architecture

## Overview

MADIA sa Partido is a builder-neutral TypeScript monorepo that can be developed in Cursor, Codex, Windsurf, VS Code, Replit, GitHub Codespaces, or another Node.js 20+ environment.

- **Web application** — Next.js App Router, responsive PWA, destination carousel, discovery, maps, itineraries, and AI assistance
- **Mobile workspace** — Expo application using shared domain and service contracts
- **Database** — Supabase PostgreSQL/PostGIS, storage, authentication, and row-level security
- **Shared packages** — domain, importers, maps, AI, and UI tokens
- **Data pipeline** — repository CSV/JSON to curated runtime and database import batches

## Public experience flow

1. The landing page loads the all-attractions carousel.
2. Visitors open destination profiles or search the directory.
3. Municipality pages group attractions, stays, food, and local services.
4. The interactive Partido map supports geographic exploration.
5. The itinerary assistant combines selected destinations and estimated costs.
6. Saved trips use local persistence and can be connected to authenticated Supabase storage.

## Data flow

1. Source tourism files live in `data/repository/`.
2. `scripts/import-runtime.mjs` cleans presentation text and writes `data/cache/madia-runtime.json`.
3. The GeoJSON processor prepares Partido municipality boundaries in `data/geojson/`.
4. Server components and route handlers read the curated runtime during local development.
5. Supabase migrations provide the production database, geospatial queries, media storage, roles, and RLS.
6. Public API routes map records to visitor-facing fields and never return full repository rows.

## Frontend boundary

The public application receives only presentation fields: destination title, municipality, type, address, description, route, image, approved attribution, and visitor details. Internal workflow fields remain server-side.

## Security

- Keep AI-provider and service-role keys server-side.
- Enforce RLS for user trips, contributions, administrator actions, and media.
- Expose only approved media through public policies.
- Validate and sanitize request bodies at API boundaries.
- Store secrets in environment variables, never in source files.

## Timezone and currency

Default timezone: `Asia/Manila`  
Default currency: Philippine peso (`PHP`)
