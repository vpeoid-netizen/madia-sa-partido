# MADIA sa Partido — Builder Instructions


These instructions apply to Cursor, Codex, Windsurf, Replit, VS Code agents, and comparable development tools.


## First action


Run:


```bash
npm run setup
```


The setup command applies the production source update, installs dependencies, processes the Partido GeoJSON, and imports the curated runtime data. The same production update runs before development and production builds.


## Authoritative direction


Use these Drive files as the product source of truth:


1. `00 MADIA App Builder Handoff`
2. `01 MADIA Final App Database v1.0`


The landing page must be a full-width carousel of every published attraction and cultural destination. Every slide must show the destination name, complete address, type, municipality, brief description, image or approved provincial fallback, an Explore action, and an Add to Itinerary action. Keep the interactive map as a secondary exploration section.


## Public content rules


Public pages, APIs, AI answers, search results, loading states, and image captions must not show workflow language such as demo, sample, preliminary, draft, review, verification, confidence, limitation, missing data, issue notes, or permission status. Optional empty fields should be omitted or replaced by the approved visual fallback.


Never expose internal source-review fields, technical IDs, raw database errors, or administrator workflow labels in visitor-facing payloads.


## Design direction


Create an elegant provincial travel experience using warm liquid-glass surfaces, destination-led photography, capiz white, coconut cream, forest green, coastal blue, muted terracotta, warm sand, and restrained antique gold. Use Cormorant Garamond or Libre Baskerville for display text and Manrope or Inter for interface text. Do not use BARABARA.


The polish target is comparable to leading travel applications such as Airbnb and Agoda, while retaining an original Partido identity.


## Engineering requirements


- Node.js 20 or newer
- Standard npm workspace commands
- Next.js App Router and TypeScript
- PostgreSQL/PostGIS or Supabase migrations and row-level security
- Portable environment variables documented in `.env.example`
- Complete public and protected APIs
- Authentication, accounts, saved destinations, saved trips, itinerary services, AI grounding, media, search, map, and administrator workflows
- Responsive desktop, tablet, and mobile behavior
- Keyboard accessibility, reduced-motion support, safe errors, and optimized images
- Type checking, linting, tests, and production build before handoff


## Required commands


```bash
npm run setup
npm run dev
npm run check
npm run build
```


Do not reintroduce map-first landing behavior, ten-item featured-only carousels, BARABARA, demo language, verification badges, confidence labels, limitation documents, or builder-specific hidden state.