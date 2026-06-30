# Bookings and Payments

## Local development (default)

Set `MADIA_PAYMENT_MODE=test` in `.env`. Bookings persist to `data/local/store.json`.

### Flow

1. Traveler opens `/book?accommodation=MADIA-CAR-ACC-001`
2. Selects dates and room from `/api/accommodations/availability`
3. Creates reservation via `POST /api/bookings`
4. Completes payment via `POST /api/bookings/{id}/pay` with `idempotency_key`
5. Views confirmation at `/bookings/{id}`

### Inventory

Default room inventory is seeded in `persistence.ts` for:

- `MADIA-CAR-ACC-001` (Tugawe Cove Resort) — Lakeside and Hillside rooms
- `MADIA-GOA-ACC-001` — Standard room

Extend via admin inventory API (production) or edit local store.

## Production (Stripe)

1. Set `MADIA_PAYMENT_MODE=stripe`
2. Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Point webhook to `/api/webhooks/stripe` (to be wired when Stripe keys are available)
4. Run Supabase migration for `payment_intents` and `bookings` tables

## Idempotency

Duplicate `idempotency_key` values return the original payment record — no double charge.

## Audit

Payment and booking events are written to `audit_logs` in the local store (Supabase `audit_logs` in production).
