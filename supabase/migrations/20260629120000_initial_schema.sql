-- MADIA sa Partido core schema (Phase 1 foundation)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE verification_status AS ENUM (
  'verified',
  'partially_verified',
  'unverified',
  'closed_or_inactive',
  'duplicate',
  'requires_manual_review'
);

CREATE TYPE confidence_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE publishing_status AS ENUM ('draft', 'published', 'archived', 'quarantined', 'admin_only');

CREATE TABLE municipalities (
  municipality_id TEXT PRIMARY KEY,
  municipality_name TEXT NOT NULL,
  municipality_name_ascii TEXT NOT NULL,
  municipality_slug TEXT NOT NULL UNIQUE,
  official_psgc_code TEXT NOT NULL UNIQUE,
  code TEXT,
  route TEXT NOT NULL,
  display_order INTEGER,
  province_name TEXT,
  province_psgc_code TEXT,
  region_name TEXT,
  region_psgc_code TEXT,
  legislative_district TEXT,
  verification_status verification_status NOT NULL DEFAULT 'partially_verified',
  confidence_level confidence_level,
  primary_source TEXT,
  date_accessed DATE,
  publishing_status publishing_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE municipality_boundaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality_id TEXT NOT NULL REFERENCES municipalities(municipality_id),
  version_label TEXT NOT NULL,
  geom GEOMETRY(Geometry, 4326) NOT NULL,
  boundary_source TEXT,
  boundary_accuracy TEXT,
  source_license TEXT,
  required_attribution TEXT,
  date_validated DATE,
  verification_status verification_status NOT NULL DEFAULT 'partially_verified',
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX municipality_boundaries_geom_idx ON municipality_boundaries USING GIST (geom);

CREATE TABLE places (
  record_id TEXT PRIMARY KEY,
  municipality_id TEXT NOT NULL REFERENCES municipalities(municipality_id),
  official_psgc_code TEXT,
  record_type TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  official_name TEXT NOT NULL,
  alternate_or_local_name TEXT,
  barangay TEXT,
  complete_address TEXT,
  location GEOGRAPHY(POINT, 4326),
  short_description TEXT,
  full_description TEXT,
  entrance_fee TEXT,
  price_range TEXT,
  operating_status TEXT,
  application_page_route TEXT,
  primary_source TEXT,
  date_accessed DATE,
  date_information_last_confirmed DATE,
  verification_status verification_status NOT NULL DEFAULT 'unverified',
  confidence_level confidence_level,
  cover_photo_id TEXT,
  publishing_status publishing_status NOT NULL DEFAULT 'published',
  import_batch_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX places_municipality_idx ON places (municipality_id);
CREATE INDEX places_location_idx ON places USING GIST (location);
CREATE INDEX places_search_idx ON places USING GIN (to_tsvector('english', official_name || ' ' || COALESCE(alternate_or_local_name, '') || ' ' || COALESCE(category, '')));

CREATE TABLE media (
  photo_id TEXT PRIMARY KEY,
  related_record_id TEXT REFERENCES places(record_id),
  municipality_id TEXT REFERENCES municipalities(municipality_id),
  permission_status TEXT NOT NULL,
  license TEXT,
  public_use_eligibility TEXT,
  required_attribution TEXT,
  storage_path TEXT,
  original_url TEXT,
  publishing_status publishing_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE import_batches (
  batch_id TEXT PRIMARY KEY,
  repository_version TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  dry_run BOOLEAN NOT NULL DEFAULT FALSE,
  summary JSONB,
  created_by UUID
);

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title TEXT NOT NULL,
  payload JSONB NOT NULL,
  traveler_count INTEGER NOT NULL DEFAULT 1,
  total_estimated_cost_php NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL
);

INSERT INTO roles (id, label) VALUES
  ('guest', 'Guest'),
  ('traveler', 'Registered Traveler'),
  ('contributor', 'Community Contributor'),
  ('owner', 'Business Owner'),
  ('validator', 'Municipal Tourism Validator'),
  ('admin', 'Super Administrator');

ALTER TABLE municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY municipalities_public_read ON municipalities
  FOR SELECT USING (publishing_status = 'published');

CREATE POLICY places_public_read ON places
  FOR SELECT USING (
    publishing_status = 'published'
    AND verification_status <> 'requires_manual_review'
  );

CREATE POLICY media_public_read ON media
  FOR SELECT USING (
    publishing_status = 'published'
    AND permission_status NOT IN ('permission_required', 'unclear_do_not_use')
  );

CREATE POLICY trips_owner_read ON trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY trips_owner_write ON trips
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
