-- Add source column to bookings for channel tracking
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'direct';

-- Add index for reporting
CREATE INDEX IF NOT EXISTS idx_bookings_source ON bookings(source);

-- Update existing bookings to have 'direct' source
UPDATE bookings SET source = 'direct' WHERE source IS NULL;
