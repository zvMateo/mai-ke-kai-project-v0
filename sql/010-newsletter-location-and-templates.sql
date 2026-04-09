-- ============================================================================
-- Newsletter: location metadata + campaign templates
-- Run this if newsletter tables already exist in your environment.
-- ============================================================================

ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS country_code CHAR(2),
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS location_consent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS geo_lat NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS geo_lng NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS geo_accuracy_meters NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS geo_captured_at TIMESTAMPTZ;

ALTER TABLE newsletter_campaigns
  ADD COLUMN IF NOT EXISTS template_type TEXT NOT NULL DEFAULT 'informative',
  ADD COLUMN IF NOT EXISTS audience_country_code CHAR(2);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'newsletter_campaigns_template_type_check'
  ) THEN
    ALTER TABLE newsletter_campaigns
      ADD CONSTRAINT newsletter_campaigns_template_type_check
      CHECK (template_type IN ('promo', 'news', 'cta', 'surf_camp', 'accommodation', 'informative'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_country_code
  ON newsletter_subscribers(country_code);

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_audience_country
  ON newsletter_campaigns(audience_country_code);
