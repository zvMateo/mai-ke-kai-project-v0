-- Add Tilopay transaction field to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS tilopay_transaction_id TEXT;

-- Add index for faster Tilopay lookups
CREATE INDEX IF NOT EXISTS idx_bookings_tilopay_transaction ON bookings(tilopay_transaction_id);

COMMENT ON COLUMN bookings.tilopay_transaction_id IS 'Tilopay transaction ID for tracking';
