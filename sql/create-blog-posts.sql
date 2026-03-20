-- ============================================================================
-- Blog Posts Table
-- Creates a blog system for content marketing
-- Run this in Supabase SQL Editor
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  author_name TEXT NOT NULL DEFAULT 'Mai Ke Kai Team',
  author_avatar_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug         ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trigger_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_blog_posts_updated_at();

-- Auto-set published_at when post is first published
CREATE OR REPLACE FUNCTION set_blog_post_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true AND (OLD.is_published = false OR OLD.published_at IS NULL) THEN
    NEW.published_at = COALESCE(NEW.published_at, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_blog_post_published_at ON blog_posts;
CREATE TRIGGER trigger_blog_post_published_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_blog_post_published_at();

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts only
CREATE POLICY "Published posts are viewable by everyone"
  ON blog_posts FOR SELECT
  USING (is_published = true);

-- Admins and staff can manage all posts (read, insert, update, delete)
CREATE POLICY "Admins and staff can manage all blog posts"
  ON blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'staff')
    )
  );

-- Grant permissions
GRANT SELECT ON blog_posts TO anon, authenticated;
GRANT ALL ON blog_posts TO service_role;

-- ============================================================================
-- VERIFICATION QUERIES (run separately to verify)
-- ============================================================================
-- SELECT * FROM blog_posts ORDER BY created_at DESC;
-- SELECT count(*) FROM blog_posts WHERE is_published = true;
