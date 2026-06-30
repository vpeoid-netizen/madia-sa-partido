# MADIA sa Partido — Architectural Decisions

## 2026-06-30 — Runtime JSON cache for tourism data

**Decision:** Import pipeline writes `data/cache/madia-runtime.json`; Next.js server modules read this cache for public pages until Supabase is configured.

**Rationale:** Enables full public browsing without production database credentials. Schema and migrations remain the production target.

## 2026-06-30 — File-based local persistence adapter

**Decision:** `apps/web/src/lib/persistence.ts` stores bookings, favorites, and room inventory in `data/local/*.json` when Supabase env vars are absent.

**Rationale:** Satisfies vertical-slice requirement for persistent booking flow in local dev. Production swaps to Supabase via the same interface.

## 2026-06-30 — Test payment provider

**Decision:** `MADIA_PAYMENT_MODE=test` uses an internal test payment adapter that records idempotent transactions in the local store (simulates Stripe test-mode semantics).

**Rationale:** No production payment credentials in repository. Activation documented in `.env.example`.

## 2026-06-30 — Carousel imagery

**Decision:** Carousel uses Wikimedia `original_url` for publicly licensed photos; all other slides use a provincial SVG fallback (`/images/provincial-fallback.svg`).

**Rationale:** Asset files are not bundled in the repository; licensed remote URLs are documented in `photos.csv`.

## 2026-06-30 — Homepage map placement

**Decision:** Landing page leads with destination carousel; interactive municipality map lives at `/map`.

**Rationale:** Aligns with master spec §6 (destination-first discovery) and README handoff (carousel primary, map secondary).

## 2026-06-30 — Public content presentation

**Decision:** Traveler-facing UI shows "Last updated" and "Source" only; hides verification status, confidence, and workflow labels.

**Rationale:** README and master spec §9 require production-facing polish without internal governance terminology.
