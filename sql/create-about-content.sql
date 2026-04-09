-- Team members table
CREATE TABLE about_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Timeline items table
CREATE TABLE about_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Site content table (key-value for misc text)
CREATE TABLE site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for about_team_members
ALTER TABLE about_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active team members"
  ON about_team_members FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage team members"
  ON about_team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'staff')
    )
  );

-- RLS for about_timeline
ALTER TABLE about_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read timeline"
  ON about_timeline FOR SELECT
  USING (true);

CREATE POLICY "Admins manage timeline"
  ON about_timeline FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'staff')
    )
  );

-- RLS for site_content
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content"
  ON site_content FOR SELECT
  USING (true);

CREATE POLICY "Admins manage site content"
  ON site_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'staff')
    )
  );

-- Seed team members
INSERT INTO about_team_members (name, role, bio, display_order) VALUES
  ('The Founders', 'Surf & Hospitality', 'A group of surfers from different corners of the world who fell in love with Tamarindo and decided to create a home for the surf community.', 1),
  ('Surf Team', 'Certified Instructors', 'Passionate local surfers and certified instructors who know every break, every current, and every perfect wave in Tamarindo.', 2),
  ('Host Team', 'Hospitality', 'The heart of Mai Ke Kai. Always ready with local tips, a cold drink, and the best smile in Tamarindo.', 3);

-- Seed timeline
INSERT INTO about_timeline (year, title, description, display_order) VALUES
  ('2019', 'The Dream Begins', 'A group of surfers from different corners of the world meet in Tamarindo and fall in love with the waves, the people, and the pura vida spirit.', 1),
  ('2020', 'Building the Home', 'The idea of creating a surf house where travelers could live the authentic Costa Rica experience takes shape.', 2),
  ('2021', 'First Guests', 'Mai Ke Kai opens its doors. First guests arrive from 12 different countries.', 3),
  ('2022', 'Growing Community', 'Word spreads. The community grows to 500+ guests from 25+ nationalities.', 4),
  ('2023', 'Mai Ke Kai Today', 'Recognized as one of the top surf hostels in Costa Rica, with 30+ nationalities and 2500+ happy guests.', 5);

-- Seed site content
INSERT INTO site_content (key, value) VALUES
  ('about_quote', 'The ocean is calling — and we must go.'),
  ('about_quote_author', 'Pura Vida, Costa Rica');
