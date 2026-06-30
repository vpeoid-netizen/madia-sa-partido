# MADIA sa Partido — Build Status

**Last updated:** 2026-06-30 (session 4)  
**Current milestone:** Homepage editorial sections + destination depth (Phase 2–3)

## Completed this session

### Homepage (Phase 2)
- **HomeSections wired** — Featured stays, Taste Partido, Upcoming events, Getting around, category chips, AI CTA
- **Municipality cards with cover photos** on homepage grid (Wikimedia + published MADIA photos)
- **Carousel “Add to itinerary”** now saves a trip and opens `/trips` (local device storage)

### Destination pages (Phase 3)
- **Place detail** — photo gallery, related stays/food/transport, save-to-favorites button
- **Municipality browse** — attraction cards use full image pipeline (`getPlaceImage`)

### Deploy fix (session 3 carry-over)
- Restored missing `packages/domain/src` TypeScript sources for Vercel builds

## Test & build results

| Suite | Result |
|-------|--------|
| `next build` | Success |

## External dependencies still required

| Dependency | Purpose |
|------------|---------|
| Supabase URL + keys | Production auth, RLS, persistent trips/favorites |
| Stripe keys | Live payments |
| `GROQ_API_KEY` or `GEMINI_API_KEY` on Vercel | Enhanced AI on live site (grounded fallback works without) |
| Licensed 360° panorama assets | True equirectangular tours |

## Next concrete tasks

- Supabase auth integration (replace local session)
- Stripe production adapter
- Multi-agent AI orchestration
- Expo mobile app
- E2E Playwright suite
