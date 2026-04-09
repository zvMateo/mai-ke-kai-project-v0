CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  avatar_url TEXT,
  package_id UUID REFERENCES surf_packages(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active testimonials"
  ON testimonials FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage testimonials"
  ON testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'staff')
    )
  );

INSERT INTO testimonials (name, location, rating, text, display_order) VALUES
  ('Sarah M.', 'Australia', 5, 'The 7-day surf camp was the best week of my life! The instructors were amazing and the waves were perfect every day.', 1),
  ('Jake R.', 'Canada', 5, 'Everything was perfectly organized. From airport pickup to the last surf session. Can''t wait to come back!', 2),
  ('Emma L.', 'Germany', 5, 'I came as a complete beginner and left standing on my own waves. The community here is incredible.', 3);
