# MADIA Production Readiness

MADIA is structured as a complete tourism application with connected frontend, API, data, database, mapping, media, itinerary, and AI layers.

## Delivered application capabilities

- Full-width carousel of all attraction and cultural-destination records
- Destination name, address, type, municipality, brief description, imagery, and direct exploration action
- Responsive navigation and mobile bottom navigation
- Searchable destination directory
- Municipality profiles and destination detail pages
- Interactive Partido municipality map
- AI tourism assistant with curated public responses
- Itinerary creation, cost estimation, and saved trips
- Runtime data import and transformation pipeline
- PostgreSQL/PostGIS schema and Supabase RLS foundation
- Approved media handling and attribution
- Builder-neutral setup for Cursor, Codex, Windsurf, VS Code, Replit, and comparable environments

## Full-stack completion standard

Every production feature must include:

1. a responsive public interface;
2. functional navigation and actions;
3. server-side API or service logic where required;
4. database schema and access policy where persistence is required;
5. validation and safe error handling;
6. accessible keyboard and touch behavior;
7. public data filtering; and
8. build, lint, and test coverage appropriate to the change.

## Production commands

```bash
npm run setup
npm run dev
npm run check
```

## Release checklist

- Carousel includes all published attraction and cultural-destination records.
- Every carousel slide includes name, address, type, municipality, description, image treatment, and action.
- Search results open working destination routes.
- Map selection opens municipality pages.
- AI responses contain visitor-facing content only.
- Itineraries can be created and saved.
- Public APIs do not return internal workflow fields.
- Desktop, tablet, and mobile layouts are visually complete.
- Environment secrets are server-side.
- `npm run check` passes.
