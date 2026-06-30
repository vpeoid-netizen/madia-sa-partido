# MADIA Production Application Requirements — v0.11

This specification overrides earlier prototype or demo-oriented presentation rules.

## Public application
The public application must present itself as a finished tourism product. Internal verification, confidence, source-review and import-state fields are not public interface content.

The landing page is an attraction carousel containing every record in `public_attractions.json`. Every attraction card displays:
- name;
- address;
- attraction type;
- brief description;
- destination image or branded provincial fallback;
- Explore attraction action; and
- Add to itinerary action.

## Design
Use an elegant provincial identity with restrained liquid-glass surfaces, forest and sea tones, warm sand, terracotta, abaca-inspired texture, refined photography, subtle topographic motifs and BARABARA display typography. The quality target is a polished consumer travel application comparable in finish and usability to Airbnb or Agoda, adapted for attractions and itinerary planning.

## Public copy
Do not render demo, sample, placeholder, needs review, confidence, verification, preliminary, prototype, coming soon, unfinished or developer-state language. Missing public details are omitted. Branded fallback artwork must not claim to be an exact attraction photograph.

## Engineering
The deliverable includes a complete responsive frontend and production backend: routes, search, filters, attraction pages, municipality pages, map, saved trips, itinerary builder, grounded AI assistant, authentication, role controls, database migrations, import pipeline, media management, admin CMS, audit logs, tests, monitoring, backups and deployment configuration.

## Internal integrity
Internal source, license and audit fields remain available to administrators and import tooling. They must not be falsified or shown as traveler-facing status labels.
