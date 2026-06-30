# MADIA sa Partido — Consolidated Preliminary Codex Handoff

Prepared: 2026-06-29
Version: 0.10-media-expansion
Coverage: All ten Partido municipalities

## Authoritative working seed files
- `madia_seed_data.json`
- category CSV exports
- `municipality_map_summaries.json`
- `photo_manifest.json`
- `source_manifest.json`
- `records_requiring_verification.csv`
- `municipality_validation_summary.csv`

## Record totals
- Municipalities: 10
- Attractions: 46
- Cultural sites: 18
- Accommodations: 30
- Restaurants/local food: 18
- Transportation records: 35
- Tourism services: 22
- Festivals/events: 15
- Municipal/emergency facilities: 70
- Photo leads: 35
- Sources: 78
- Verification issues: 210

## Deployment rules
This is a working seed dataset, not a complete public directory. Keep verification status and confidence visible in the admin interface. Do not publicly display unconfirmed fares or schedules as current. Do not deploy photos requiring permission or unclear licenses. Do not enable production polygon navigation until the boundary source is acquired, validated, attributed, and converted to EPSG:4326.

## Join keys
- Municipality: `municipality_id` or `official_psgc_code`
- Entity: `record_id`
- Transportation: `route_id`
- Photo: `photo_id` linked by `related_record_id`
- Sources: `source_id` and source URL

## Map status
No geometry was fabricated. Use the included map metadata, source assessment, validation report, and implementation brief when the source boundary asset becomes available.

## Version 0.7 media update
Six exact Wikimedia Commons files have verified CC BY-SA 4.0 metadata and original-file URLs:
four Caramoan images and two Caloco Beach images. The byte downloads remain incomplete because the execution environment could not resolve `upload.wikimedia.org`. The original URLs, creators, dimensions, dates, attribution requirements, and failed-download notes are retained in `photos.csv`, `photo_manifest.json`, and `madia_seed_data.json`.

## Exact preferred boundary asset
`municipalities.geojson` from release `v2026.4.13.0`, published 2026-06-16.
SHA-256: `3c6d8f48f33dab01d6bd0b83a31229577817286a01ac23e5d290ddbd4c6f51ef`.
The asset could not be downloaded in this execution environment and no substitute geometry was fabricated.


## Version 0.8 photo-upload update

Uploaded image files recorded in the package: **16**.

This version:
- records Drive file links for sixteen municipality images;
- adds exact creator, license, source-page, original-file and attribution metadata;
- adds Garchitorena Lagoon, Kinahulogan Falls, Nato Beach and Angelica Beach as partially verified working attraction records;
- updates municipality counts and lightweight map summaries; and
- retains non-verified operational details as review items.

The uploaded JPEGs may be used by Codex only through the media/import layer. License and attribution fields must remain attached to each public rendering.


## Version 0.9 supplemental-media update

Uploaded image files recorded in the package: **24**.

Added media coverage:
- Garchitorena island landscape
- Presentacion town and coastal view
- Siruma coastal landscape
- Lagonoy River
- Saints Philip and James Parish detail
- Saint Joseph Parish Church in San Jose
- Tigaon Public Market
- Don Pascual P. Leelin Sr. Park

Two Lagonoy image records remain permission or attribution-review items in the admin workflow.
All other new images in this batch have verified CC BY-SA 4.0 metadata and creator attribution.


## Version 0.10 media expansion

Uploaded media files recorded in this package: **32**.

New or updated coverage:
- Le Isla Pighaluban, Garchitorena
- Aguirangan Rose Island, Presentacion
- San Pascual Baylon Parish Church, Tinambac
- Saint Andrew the Apostle Parish Church, Sagñay
- Caramoan Peninsula
- Updated March 2026 Goa church view
- Goa access-road image
- Third Caloco Beach view

The Goa road image uses CC BY-SA 3.0. The remaining images in this batch use
CC BY-SA 4.0. Codex must preserve the exact license version and creator attribution.


## Version 0.11 production-experience override

Use `production_app_config.json`, `public_attractions.json`,
`public_attractions.csv`, `production_acceptance_checklist.csv`, and
`PRODUCTION_APP_REQUIREMENTS.md` as the authoritative public-product layer.

The landing page is no longer map-first. It is an attraction carousel containing
every public attraction and displaying name, address, type and brief description.
The map remains an important secondary navigation and exploration route.

Do not expose internal verification, confidence, review or import-state text in
the public application. The public application must look and behave as a complete,
polished tourism product with an elegant provincial identity. Frontend and backend
completion criteria are defined in the production configuration and acceptance
checklist.
