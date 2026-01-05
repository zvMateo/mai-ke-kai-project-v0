-- Add image fields to rooms and services tables
-- Version: 006 - Image Support

-- Add image fields to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS main_image TEXT;

-- Add image field to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN rooms.images IS 'Array of Cloudinary image URLs for room gallery';
COMMENT ON COLUMN rooms.main_image IS 'Main/featured Cloudinary image URL for room';
COMMENT ON COLUMN services.image_url IS 'Cloudinary image URL for service';
