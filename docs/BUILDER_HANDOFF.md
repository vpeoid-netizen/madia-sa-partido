# MADIA Builder Handoff

## Start here

```bash
npm run setup
npm run dev
```

The project is compatible with Cursor, Codex, Windsurf, VS Code, Replit, and other Node.js 20+ development environments.

## Primary application flow

1. Home opens to the all-attractions carousel.
2. A visitor opens a destination or browses search results.
3. Municipality and place pages present polished visitor information.
4. The interactive map provides geographic discovery.
5. MADIA creates itinerary suggestions and estimated trip costs.
6. Trips can be saved locally and connected to authenticated persistence through Supabase.
7. Administrator services use the database and import pipeline to maintain content.

## Public data contract

Public responses contain only visitor-facing fields such as title, municipality, type, address, description, route, image, visitor details, and approved attribution. Full repository rows remain server-side.

## Full-stack architecture

- Frontend: Next.js App Router and responsive PWA shell
- API: Next.js route handlers for search and AI
- Database: Supabase PostgreSQL/PostGIS migrations with RLS
- Media: approved photo records and attribution
- Maps: MapLibre plus processed Partido GeoJSON
- Data: CSV/JSON repository transformed by `scripts/import-runtime.mjs`
- Shared code: domain, maps, importers, AI, and UI workspaces

## Quality gate

Run:

```bash
npm run check
```

Confirm the carousel, search, municipality pages, place pages, map, AI assistant, itinerary saving, and mobile navigation before delivery.
