-- Hotel Settings table
-- Stores a single row of configurable hotel parameters

CREATE TABLE IF NOT EXISTS hotel_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_name      TEXT NOT NULL DEFAULT 'Mai Ke Kai Surf House',
  contact_email   TEXT NOT NULL DEFAULT 'maikekaisurfhouse@gmail.com',
  contact_phone   TEXT NOT NULL DEFAULT '+506 8606 9355',
  address         TEXT NOT NULL DEFAULT 'Playa Tamarindo, Guanacaste, Costa Rica',
  check_in_time   TEXT NOT NULL DEFAULT '15:00',
  check_out_time  TEXT NOT NULL DEFAULT '11:00',
  iva_rate        NUMERIC(5,2) NOT NULL DEFAULT 13,
  currency        TEXT NOT NULL DEFAULT 'USD',
  instagram_url   TEXT,
  facebook_url    TEXT,
  whatsapp        TEXT DEFAULT '+506 8606 9355',
  youtube_url     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only allow admins to read/write settings
ALTER TABLE hotel_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read settings"
  ON hotel_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins can update settings"
  ON hotel_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Seed default row
INSERT INTO hotel_settings (
  hotel_name, contact_email, contact_phone, address,
  check_in_time, check_out_time, iva_rate, currency,
  instagram_url, facebook_url, whatsapp, youtube_url
)
VALUES (
  'Mai Ke Kai Surf House',
  'maikekaisurfhouse@gmail.com',
  '+506 8606 9355',
  'Playa Tamarindo, Guanacaste, Costa Rica',
  '15:00',
  '11:00',
  13,
  'USD',
  'https://instagram.com/maikekaisurfhouse',
  'https://facebook.com/maikekaisurfhouse',
  '+506 8606 9355',
  NULL
)
ON CONFLICT DO NOTHING;
