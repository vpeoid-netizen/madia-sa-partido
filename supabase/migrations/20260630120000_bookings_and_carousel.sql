-- Booking, payments, and featured carousel (Phase 6 extension)
CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'modified',
  'cancelled',
  'completed',
  'no_show',
  'refunded'
);

CREATE TABLE room_types (
  id TEXT PRIMARY KEY,
  accommodation_id TEXT NOT NULL REFERENCES places(record_id),
  name TEXT NOT NULL,
  max_occupancy INTEGER NOT NULL DEFAULT 2,
  nightly_rate_php NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE room_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type_id TEXT NOT NULL REFERENCES room_types(id),
  total_rooms INTEGER NOT NULL DEFAULT 1,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id TEXT NOT NULL REFERENCES places(record_id),
  room_type_id TEXT NOT NULL REFERENCES room_types(id),
  user_id UUID,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  subtotal_php NUMERIC(12,2) NOT NULL,
  taxes_php NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_php NUMERIC(12,2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  amount_php NUMERIC(12,2) NOT NULL,
  provider TEXT NOT NULL,
  provider_ref TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE featured_destination_slides (
  featured_slide_id TEXT PRIMARY KEY,
  destination_record_id TEXT NOT NULL REFERENCES places(record_id),
  municipality_id TEXT NOT NULL REFERENCES municipalities(municipality_id),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  actor TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY bookings_owner_read ON bookings
  FOR SELECT USING (auth.uid() = user_id OR guest_email = auth.jwt() ->> 'email');

CREATE POLICY payment_intents_owner_read ON payment_intents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = payment_intents.booking_id
      AND (b.user_id = auth.uid() OR b.guest_email = auth.jwt() ->> 'email')
    )
  );
