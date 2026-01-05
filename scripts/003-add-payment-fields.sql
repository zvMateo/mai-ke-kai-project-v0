-- Add PayPal fields to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paypal_order_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;

-- Add index for faster PayPal lookups
CREATE INDEX IF NOT EXISTS idx_bookings_paypal_order ON bookings(paypal_order_id);

-- Add comment
COMMENT ON COLUMN bookings.paypal_order_id IS 'PayPal order ID for tracking';
COMMENT ON COLUMN bookings.paypal_capture_id IS 'PayPal capture ID after payment completion';
