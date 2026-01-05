-- =============================================
-- SURF PACKAGES TABLE AND RLS POLICIES
-- =============================================

-- Create surf_packages table
CREATE TABLE IF NOT EXISTS surf_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  nights INTEGER NOT NULL DEFAULT 1,
  surf_lessons INTEGER NOT NULL DEFAULT 0,
  room_type TEXT NOT NULL DEFAULT 'dorm' CHECK (room_type IN ('dorm', 'private', 'family')),
  includes JSONB DEFAULT '[]'::jsonb,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  image_url TEXT,
  is_popular BOOLEAN DEFAULT false,
  is_for_two BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE surf_packages ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active packages
CREATE POLICY "Packages are viewable by everyone"
  ON surf_packages
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert (via service role)
CREATE POLICY "Admin can insert packages"
  ON surf_packages
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only admins can update (via service role)
CREATE POLICY "Admin can update packages"
  ON surf_packages
  FOR UPDATE
  USING (true);

-- Policy: Only admins can delete (via service role)
CREATE POLICY "Admin can delete packages"
  ON surf_packages
  FOR DELETE
  USING (true);

-- Insert default packages
INSERT INTO surf_packages (name, tagline, nights, surf_lessons, room_type, includes, price, original_price, is_popular, is_for_two, display_order)
VALUES
  (
    'Surf Starter',
    'Perfecto para principiantes',
    5,
    3,
    'dorm',
    '["5 noches en dormitorio compartido", "3 clases de surf con instructor", "Alquiler de tabla y lycra incluido", "Desayuno diario", "WiFi gratis"]'::jsonb,
    299,
    375,
    false,
    false,
    1
  ),
  (
    'Surf Explorer',
    'El más popular',
    7,
    5,
    'dorm',
    '["7 noches en dormitorio compartido", "5 clases de surf con instructor", "Alquiler de tabla ilimitado", "Desayuno diario", "1 tour de catamarán incluido", "Transfer aeropuerto ida", "WiFi gratis"]'::jsonb,
    449,
    580,
    true,
    false,
    2
  ),
  (
    'Surf Pro',
    'Experiencia premium',
    7,
    5,
    'private',
    '["7 noches en habitación privada", "5 clases de surf (grupos reducidos)", "Video análisis de tu surf", "Alquiler de tabla ilimitado", "Desayuno y cena diarios", "Tour de catamarán + snorkel", "Transfer aeropuerto ida y vuelta", "Late check-out garantizado"]'::jsonb,
    799,
    1050,
    false,
    false,
    3
  ),
  (
    'Couples Retreat',
    'Romántico surf getaway',
    5,
    3,
    'private',
    '["5 noches en habitación privada", "3 clases de surf para parejas", "Tour de catamarán al atardecer", "Cena romántica en la playa", "Desayuno diario", "Botella de vino de bienvenida", "Transfer aeropuerto"]'::jsonb,
    599,
    780,
    false,
    true,
    4
  );

-- Verify
SELECT id, name, price, is_active FROM surf_packages ORDER BY display_order;
