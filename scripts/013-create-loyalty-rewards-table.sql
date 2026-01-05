-- =============================================
-- LOYALTY REWARDS TABLE
-- =============================================

-- Create loyalty_rewards table
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('surf', 'accommodation', 'food', 'transport', 'tour', 'other')),
  icon TEXT DEFAULT 'gift', -- icon name for frontend
  is_active BOOLEAN DEFAULT true,
  quantity_available INTEGER, -- null = unlimited
  times_redeemed INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;

-- Everyone can view active rewards
CREATE POLICY "Rewards are viewable by everyone"
  ON loyalty_rewards
  FOR SELECT
  USING (true);

-- Admin can insert/update/delete via service role
CREATE POLICY "Admin can insert rewards"
  ON loyalty_rewards
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can update rewards"
  ON loyalty_rewards
  FOR UPDATE
  USING (true);

CREATE POLICY "Admin can delete rewards"
  ON loyalty_rewards
  FOR DELETE
  USING (true);

-- Insert default rewards
INSERT INTO loyalty_rewards (name, description, points_required, category, icon, display_order)
VALUES
  ('Clase de Surf Gratis', 'Una clase de surf de 2 horas con instructor', 500, 'surf', 'waves', 1),
  ('Noche Gratis en Dorm', 'Una noche en habitación compartida', 1000, 'accommodation', 'star', 2),
  ('Desayunos x 7 días', 'Desayuno incluido por una semana', 300, 'food', 'coffee', 3),
  ('Transfer Aeropuerto', 'Transporte ida o vuelta al aeropuerto', 400, 'transport', 'car', 4),
  ('50% Catamarán Tour', 'Descuento en tour de catamarán', 600, 'tour', 'ship', 5),
  ('Upgrade a Privada', 'Upgrade de dorm a habitación privada (1 noche)', 800, 'accommodation', 'star', 6);

-- Verify
SELECT id, name, points_required, category, is_active FROM loyalty_rewards ORDER BY display_order;
