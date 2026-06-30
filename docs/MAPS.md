# Maps

## Production files

- `data/geojson/partido_municipalities_web.geojson` — default client payload
- `data/geojson/partido_municipalities_light.geojson` — simplified coordinates
- `data/geojson/partido_municipalities_master.geojson` — full precision for admin
- `data/geojson/partido_municipality_centroids.csv`

## Source

Subset of Philippine administrative municipality boundaries (PSGC-based release v2026.4.13.0). Properties enriched with MADIA `municipality_id`, slugs, and map summaries.

## Attribution

Displayed in the landing map:

- © OpenStreetMap contributors (basemap)
- © PSA / NAMRIA administrative boundaries (indicative, non-cadastral)

## Join

Features join to database records via `municipality_id` or `official_psgc_code`. Display names are not used as primary keys.

## Low bandwidth

Use `partido_municipalities_light.geojson` when `Save-Data` or connection quality flags request reduced payload.
