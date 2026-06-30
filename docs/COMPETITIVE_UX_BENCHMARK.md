# Competitive UX Benchmark — MADIA sa Partido

Review date: 2026-06-29

## Applications reviewed

| Application | Journeys reviewed | Strong patterns | Problems to avoid |
|---|---|---|---|
| Google Maps | Municipality discovery, place details, directions | Clear map/list sync, strong search suggestions, visible attribution | Generic content without local verification |
| Airbnb | Filters, photography, saved lists | Clean filter chips, trustworthy price labeling | Commercial ranking opaque to users |
| Tripadvisor | Reviews, destination pages | Rich place detail hierarchy | Mixed verification quality |
| Wanderlog | Itinerary building, map of stops, budgeting | Day-by-day structure, map of itinerary | Can assume costs without sources |

## MADIA advantages

- Municipality-first Partido map with accessible list alternative
- Verification status, source, and freshness on records
- Grounded AI that refuses to invent missing fees or schedules
- Integrated transportation and local directories from one repository
- Age-inclusive controls and simplified mode architecture

## Adopted decisions

- Map-first landing without hero banner above map
- First mobile tap selects municipality; explicit Explore action navigates
- Verification badges with non-color cues (labels + borders)
- Budget lines separate verified amounts from unavailable fees

## Gaps for future releases

- Live routing and travel-time estimates
- Collaborative trip editing
- Full admin dashboard UI
- Native mobile parity and offline cache

## Rationale

MADIA competes on trust and local completeness within Partido, not on copying global app chrome. Patterns are adapted where they improve task completion for first-time and older users.
