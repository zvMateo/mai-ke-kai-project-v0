-- Add PayPal tracking fields to bookings table

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;

-- Add index for PayPal order lookups
CREATE INDEX IF NOT EXISTS idx_bookings_paypal_order ON bookings(paypal_order_id);

-- Update types to reflect the new database structure
COMMENT ON COLUMN bookings.paypal_order_id IS 'PayPal Order ID for tracking';
COMMENT ON COLUMN bookings.paypal_capture_id IS 'PayPal Capture ID after payment completion';
