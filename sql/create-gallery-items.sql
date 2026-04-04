-- ============================================================
-- Gallery Items Table — Mai Ke Kai
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS gallery_items (
  id            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT,
  description   TEXT,
  image_url     TEXT         NOT NULL,
  category      TEXT         NOT NULL DEFAULT 'general',
  -- categories: surf | rooms | community | nature | lifestyle
  display_order INTEGER      DEFAULT 0,
  is_featured   BOOLEAN      DEFAULT false,
  is_active     BOOLEAN      DEFAULT true,
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE TRIGGER update_gallery_items_updated_at
  BEFORE UPDATE ON gallery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row-Level Security
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Public can read active items (for landing page)
CREATE POLICY "Public can view active gallery items"
  ON gallery_items FOR SELECT
  USING (is_active = true);

-- Admins and staff can manage everything
CREATE POLICY "Admins manage gallery items"
  ON gallery_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'staff')
    )
  );

-- Seed some example items (optional — delete if you want to start empty)
INSERT INTO gallery_items (title, image_url, category, display_order, is_featured, is_active)
VALUES
  ('Surf Lesson at Sunrise',      '/surf-instructor-teaching-beginner-on-beach-costa-r.jpg', 'surf',      1,  true,  true),
  ('Tamarindo Beach',             '/beautiful-costa-rica-surf-beach-with-palm-trees-an.jpg', 'nature',    2,  true,  true),
  ('Our Cozy Dorm Room',          '/modern-surf-hostel-dorm-room-with-wooden-bunk-beds.jpg', 'rooms',     3,  false, true),
  ('Private Room Paradise',       '/cozy-private-room-with-king-bed-tropical-decor-and.jpg', 'rooms',     4,  false, true),
  ('Catamaran Sunset Tour',       '/catamaran-tour-sunset-costa-rica-ocean.jpg',              'lifestyle', 5,  true,  true),
  ('Surfboard Rentals',           '/surf-boards-rental-rack-tropical-beach.jpg',              'surf',      6,  false, true)
ON CONFLICT DO NOTHING;
