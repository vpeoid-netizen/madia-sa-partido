-- Community submissions
CREATE TYPE submission_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'returned'
);

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type TEXT NOT NULL,
  municipality_id TEXT NOT NULL REFERENCES municipalities(municipality_id),
  submitter_user_id UUID,
  submitter_email TEXT NOT NULL,
  submitter_name TEXT NOT NULL,
  payload JSONB NOT NULL,
  status submission_status NOT NULL DEFAULT 'submitted',
  reviewer_id UUID,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  properties JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX submissions_municipality_idx ON submissions (municipality_id);
CREATE INDEX submissions_status_idx ON submissions (status);
CREATE INDEX analytics_events_name_idx ON analytics_events (event_name);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY submissions_owner_read ON submissions
  FOR SELECT USING (submitter_email = auth.jwt() ->> 'email');
