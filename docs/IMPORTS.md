# Imports

## Authoritative inputs (v0.10)

From `madia-data-10.zip`:

- `madia_seed_data.json`
- CSV exports (municipalities, attractions, cultural sites, accommodations, restaurants, transportation, services, events, facilities, photos, sources, verification queue)
- `municipality_map_summaries.json`
- Map metadata (boundaries processed separately)

## Commands

```bash
npm run process:geojson   # subset Partido boundaries
npm run import:dry-run    # validate without writing cache
npm run import:data       # write data/cache/madia-runtime.json
```

## Rules

- Stable IDs for idempotent re-import
- No fabricated tourism records
- Quarantine rows outside Partido scope or with invalid foreign keys
- Preserve verification and media permission metadata
- Missing files → importer reports clearly; UI shows empty states

## Boundary note

Production GeoJSON is generated from downloaded `municipalities.geojson` (PSGC v2026.4.13.0 asset). Attribution and indicative accuracy disclaimer are required on the map.
