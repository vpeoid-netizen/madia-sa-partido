# Database

See `supabase/migrations/20260629120000_initial_schema.sql` for the Phase 1 schema.

## Core entities

- `municipalities` — stable IDs and PSGC codes
- `municipality_boundaries` — PostGIS geometries with version labels
- `places` — unified tourism records with `record_type`
- `media` — permission-aware photo metadata
- `import_batches` — auditable imports
- `trips` — saved itineraries (user-scoped)
- `roles` — RBAC foundation

## Join keys

- Municipality: `municipality_id` or `official_psgc_code`
- Place: `record_id`
- Photo: `photo_id` → `related_record_id`

## RLS summary

| Table | Public read |
|---|---|
| municipalities | published only |
| places | published, not `requires_manual_review` |
| media | published, not `permission_required` / `unclear_do_not_use` |
| trips | owner only |

## PostGIS

- `municipality_boundaries.geom` — polygon/multipolygon EPSG:4326
- `places.location` — geography point for nearby search
