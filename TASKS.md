# MADIA sa Partido — Implementation Backlog

`[x]` done · `[~]` partial · `[ ]` not started

## Phase 1 — Foundation

- [x] Monorepo + TypeScript strict
- [x] Supabase migrations (core + bookings + submissions)
- [x] Import pipeline + dry-run
- [x] Design tokens + liquid-glass CSS
- [x] CI workflow
- [~] Supabase auth (local session dev adapter; production keys pending)
- [x] Audit log writes
- [x] Rate limiting middleware
- [x] Local role-based auth guards (admin/validator/owner)

## Phase 2 — Homepage & editorial

- [x] Destination carousel (57 attractions)
- [x] Carousel admin curation UI
- [x] Homepage sections with images
- [x] Carousel analytics events

## Phase 3 — Geographic exploration

- [x] Partido municipality map with cover images
- [x] Municipality profiles (all categories) with thumbnails
- [x] Place detail pages + photo gallery + panorama preview
- [x] Search + filters with result thumbnails

## Phase 4 — Traveler planning

- [x] Saved trips (localStorage)
- [x] Favorites (API + local store)
- [x] Trip sharing (share links)
- [~] Local session auth (`/account`) with accessibility prefs
- [ ] Supabase-backed favorites/trips

## Phase 5 — Contributions

- [x] Submission workflow (`/contribute`) — new place, correction, photo, price, route, report, event
- [x] Municipal review UI (`/admin/review`) with validator scoping
- [x] Approved submission patch queue
- [x] Owner claims UI (`/owner/claim`)

## Phase 6 — Booking & payments

- [x] Room inventory model
- [x] Availability API
- [x] Booking checkout + test payment
- [x] Cancellation/refund flow with authorization
- [x] Owner/admin reservation dashboard (`/admin/bookings`)
- [~] Stripe production adapter (webhook route scaffolded)

## Phase 7 — AI

- [x] Grounded concierge (rule-based)
- [~] LLM provider integration (optional when `AI_API_KEY` set)
- [ ] Multi-agent orchestration
- [x] AI evaluations (concierge grounding tests)

## Phase 8 — Virtual tours

- [~] Panorama drag viewer (360 assets pending)
- [ ] AR demonstration

## Phase 9 — Mobile

- [ ] Expo core flows

## First vertical slice (§28)

- [x] Carousel → destination → save → related listings
- [x] Room availability → reservation → test payment → confirmation
- [x] AI question → trip → budget
- [x] Admin: import → carousel → submissions → audit
- [x] Map → municipality → browse categories
