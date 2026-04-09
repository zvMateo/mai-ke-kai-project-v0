-- ============================================================================
-- Newsletter System
-- Creates subscriber and campaign tables for marketing/news communications
-- Run this in Supabase SQL Editor
-- ============================================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  locale TEXT,
  country_code CHAR(2),
  timezone TEXT,
  location_consent BOOLEAN NOT NULL DEFAULT false,
  geo_lat NUMERIC(9,6),
  geo_lng NUMERIC(9,6),
  geo_accuracy_meters NUMERIC(10,2),
  geo_captured_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid(),
  source TEXT,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  content_html TEXT NOT NULL,
  preview_text TEXT,
  template_type TEXT NOT NULL DEFAULT 'informative' CHECK (template_type IN ('promo', 'news', 'cta', 'surf_camp', 'accommodation', 'informative')),
  audience_country_code CHAR(2),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  recipients_count INTEGER NOT NULL DEFAULT 0,
  successful_sends INTEGER NOT NULL DEFAULT 0,
  failed_sends INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_unsubscribe_token ON newsletter_subscribers(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_country_code ON newsletter_subscribers(country_code);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_audience_country ON newsletter_campaigns(audience_country_code);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_created_at ON newsletter_campaigns(created_at DESC);

CREATE OR REPLACE FUNCTION update_newsletter_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_newsletter_subscribers_updated_at ON newsletter_subscribers;
CREATE TRIGGER trigger_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_subscribers_updated_at();

CREATE OR REPLACE FUNCTION update_newsletter_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_newsletter_campaigns_updated_at ON newsletter_campaigns;
CREATE TRIGGER trigger_newsletter_campaigns_updated_at
  BEFORE UPDATE ON newsletter_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_campaigns_updated_at();

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Public can subscribe, but unsubscribe is handled server-side with a token endpoint.
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'subscribed');

-- Admin access for management.
CREATE POLICY "Admins can manage newsletter subscribers"
  ON newsletter_subscribers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage newsletter campaigns"
  ON newsletter_campaigns FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

GRANT INSERT ON newsletter_subscribers TO anon;
GRANT INSERT, UPDATE ON newsletter_subscribers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON newsletter_subscribers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON newsletter_campaigns TO authenticated;
GRANT ALL ON newsletter_subscribers TO service_role;
GRANT ALL ON newsletter_campaigns TO service_role;

-- ============================================================================
-- Optional verification queries
-- ============================================================================
-- SELECT status, COUNT(*) FROM newsletter_subscribers GROUP BY status;
-- SELECT id, title, status, recipients_count, successful_sends, failed_sends FROM newsletter_campaigns ORDER BY created_at DESC;
