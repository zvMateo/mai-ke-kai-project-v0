-- ============================================================================
-- Service Categories Table
-- Creates a fully customizable service category system
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'package',
  color TEXT DEFAULT 'blue',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON service_categories(slug);
CREATE INDEX IF NOT EXISTS idx_service_categories_display_order ON service_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_service_categories_is_active ON service_categories(is_active);

-- Add category_id column to services table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE services ADD COLUMN category_id UUID REFERENCES service_categories(id);
  END IF;
END $$;

-- Create index for services.category_id
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);

-- Insert default categories (based on existing hardcoded values)
INSERT INTO service_categories (name, slug, description, icon, color, display_order, is_active)
VALUES 
  ('Surf', 'surf', 'Surf lessons and board rentals', 'waves', 'blue', 1, true),
  ('Tours', 'tour', 'Tours and excursions', 'ship', 'green', 2, true),
  ('Transport', 'transport', 'Transportation services', 'car', 'orange', 3, true),
  ('Other', 'other', 'Other services', 'package', 'gray', 4, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  display_order = EXCLUDED.display_order;

-- Update existing services to link to categories by slug
-- This assumes the current 'category' column contains slugs like 'surf', 'tour', etc.
UPDATE services s
SET category_id = sc.id
FROM service_categories sc
WHERE s.category = sc.slug
AND s.category_id IS NULL;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_service_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_service_categories_updated_at ON service_categories;
CREATE TRIGGER trigger_service_categories_updated_at
  BEFORE UPDATE ON service_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_service_categories_updated_at();

-- Enable RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Service categories are viewable by everyone"
  ON service_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service categories are manageable by admins"
  ON service_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Grant permissions
GRANT SELECT ON service_categories TO anon, authenticated;
GRANT ALL ON service_categories TO service_role;

-- ============================================================================
-- VERIFICATION QUERIES (run separately to verify)
-- ============================================================================

-- Check categories were created:
-- SELECT * FROM service_categories ORDER BY display_order;

-- Check services were linked:
-- SELECT s.id, s.name, s.category, s.category_id, sc.name as category_name
-- FROM services s
-- LEFT JOIN service_categories sc ON s.category_id = sc.id;
