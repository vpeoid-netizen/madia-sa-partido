# MADIA sa Partido — Build Status

**Last updated:** 2026-06-30 (session 3)  
**Current milestone:** Authorization, owner reservations, contributions, images

## Completed this session

### Branding
- **Official logo** integrated — header, favicon, PWA icons, Open Graph / Twitter cards
- Assets: `public/images/madia-logo.png`, `public/icons/icon-{192,512}.png`, `src/app/icon.png`

### Owner portal (Phase 5–6)
- **Business claim form** at `/owner/claim`
- **Stripe webhook scaffold** at `/api/webhooks/stripe` (production keys pending)

### Authorization & staff tools
- **Role-based auth** via `lib/auth.ts` — admin, validator, owner, traveler roles from env
- **Protected APIs** — `/api/admin`, `/api/admin/carousel`, submission review/list, analytics GET, booking list
- **Staff gate** on `/admin/*` pages with sign-in prompt
- **Fixed privilege escalation** — client can no longer self-assign admin role on sign-in
- **Owner reservation dashboard** at `/admin/bookings`
- **Validator municipality scoping** on submission review

### Contributions (Phase 5)
- Expanded **contribute form** — photo, price, route, and event types
- **Approved submissions** queued to `data/local/submission-patches.json` for import merge

### Images (Phase 2–3)
- Image resolution across homepage, map, explore, municipalities, place detail, related listings
- Wikimedia URL normalization + provincial SVG fallback
- `MadiaImage` client component with gallery and hero layouts

### Account & accessibility
- **Display preferences** on `/account` — simplified layout and high contrast
- Staff tools link for authorized roles

## Test & build results

| Suite | Result |
|-------|--------|
| `packages/domain` vitest | passing |
| `apps/web` vitest | 13+ tests (auth, images, persistence, workflows, carousel) |
| `next build` | Success |

## Local dev sign-in

| Email | Role |
|-------|------|
| `admin@madia.local` | Administrator |
| `validator@caramoan.gov` | Validator (Caramoan) |
| `owner@caramoan.gov` | Owner (MADIA-CAR-ACC-001) |

Configure additional emails in `.env` — see `.env.example`.

## External dependencies still required

| Dependency | Purpose |
|------------|---------|
| Supabase URL + keys | Production auth, RLS, persistent trips/favorites |
| Stripe keys | Live payments |
| `AI_API_KEY` | Enhanced LLM phrasing (rule-based fallback works without) |
| Licensed 360° panorama assets | True equirectangular tours |
| Local media on disk | Replace provincial fallback for most places |

## Remaining major work

- Supabase auth integration (replace local session)
- Owner claims UI (business portal)
- Stripe production adapter + webhook route
- Multi-agent AI orchestration + evaluations
- True WebXR / AR demonstration
- Expo mobile app
- E2E Playwright suite

## Commands

```bash
cd madia-platform
export PATH="$(pwd)/.tools/node/bin:$(pwd)/node_modules/.bin:$PATH"
cd apps/web && next dev -p 3000
```
