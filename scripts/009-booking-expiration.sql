-- Migration: Add automatic expiration for unpaid bookings
-- Bookings with status 'pending_payment' older than 24 hours are expired

-- Function to expire stale pending_payment bookings
CREATE OR REPLACE FUNCTION expire_pending_bookings()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE bookings
  SET 
    status = 'cancelled',
    special_requests = COALESCE(special_requests, '') || E'\n[AUTO-EXPIRED] Payment not received within 24 hours.',
    updated_at = NOW()
  WHERE 
    status = 'pending_payment'
    AND created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Optional: If you have pg_cron extension enabled (Supabase Pro plan),
-- you can schedule this to run every hour:
-- SELECT cron.schedule('expire-pending-bookings', '0 * * * *', 'SELECT expire_pending_bookings()');
