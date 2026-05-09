-- ============================================================================
-- Phase 0 Cleanup — Drop PMS transactional tables
-- ============================================================================
--
-- Run this migration in the Supabase SQL Editor AFTER the application code
-- no longer references these tables. The Phase 0 codebase cleanup removes
-- all readers/writers; once `pnpm build` passes locally and on staging,
-- it is safe to apply this migration.
--
-- BEFORE RUNNING:
--   1. Take a `pg_dump` snapshot of production
--   2. Confirm `pnpm build && pnpm type-check` pass on the cleanup branch
--   3. Confirm Tab.Travel widget is the sole booking surface in production
--
-- KEPT TABLES (read-only marketing content; do NOT drop):
--   rooms, beds, services, service_categories, surf_packages, hotel_settings,
--   blog_posts, gallery_items, about_team_members, about_timeline,
--   site_content, testimonials, newsletter_subscribers, newsletter_campaigns,
--   users, email_confirmation_tokens
--
-- DROPPED TABLES (Tab.Travel handles bookings/payments/loyalty externally):
--   loyalty_transactions, loyalty_rewards, booking_services, booking_rooms,
--   bookings, season_pricing, season_dates, room_blocks, pending_signups,
--   payment_webhooks, check_in_data
--
-- The DROPs follow foreign-key dependency order so referential integrity
-- holds while in-flight (within the transaction).
-- ============================================================================

BEGIN;

-- 1) Loyalty (depends on users + bookings)
DROP TABLE IF EXISTS public.loyalty_transactions CASCADE;
DROP TABLE IF EXISTS public.loyalty_rewards CASCADE;

-- 2) Check-in data (depends on bookings)
DROP TABLE IF EXISTS public.check_in_data CASCADE;

-- 3) Booking line items (depend on bookings)
DROP TABLE IF EXISTS public.booking_services CASCADE;
DROP TABLE IF EXISTS public.booking_rooms CASCADE;

-- 4) Payment webhooks (depend on bookings)
DROP TABLE IF EXISTS public.payment_webhooks CASCADE;

-- 5) Bookings root
DROP TABLE IF EXISTS public.bookings CASCADE;

-- 6) Pricing & calendar
DROP TABLE IF EXISTS public.season_pricing CASCADE;
DROP TABLE IF EXISTS public.season_dates CASCADE;
DROP TABLE IF EXISTS public.room_blocks CASCADE;

-- 7) Pending signups (legacy guest signup flow — replaced by Tab.Travel)
DROP TABLE IF EXISTS public.pending_signups CASCADE;

-- 8) Drop obsolete enums (only if not referenced by surviving tables)
DROP TYPE IF EXISTS public.booking_status_enum;
DROP TYPE IF EXISTS public.payment_status_enum;
DROP TYPE IF EXISTS public.payment_gateway_enum;
DROP TYPE IF EXISTS public.webhook_status_enum;

-- 9) Trim users table — drop columns tied to PMS (loyalty / passport for guests)
--    These columns are no longer in the User TypeScript interface.
ALTER TABLE public.users DROP COLUMN IF EXISTS loyalty_points;
ALTER TABLE public.users DROP COLUMN IF EXISTS passport_number;
ALTER TABLE public.users DROP COLUMN IF EXISTS passport_expiry;
ALTER TABLE public.users DROP COLUMN IF EXISTS date_of_birth;
ALTER TABLE public.users DROP COLUMN IF EXISTS emergency_contact;

-- 10) Restrict users.role to the simplified enum (`guest | admin`)
--     Adjust the CHECK constraint name to your existing constraint if different.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_role_check;
  END IF;
END $$;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('guest', 'admin'));

-- 11) Migrate any existing 'volunteer' or 'staff' rows to 'admin' before
--     the constraint above takes effect (so the migration doesn't fail).
--     Run this BEFORE step 10 if you have such rows; the order above assumes
--     no volunteer/staff rows remain. Adjust if needed:
-- UPDATE public.users SET role = 'admin' WHERE role IN ('volunteer', 'staff');

COMMIT;

-- ============================================================================
-- ROLLBACK STRATEGY (manual, if needed)
-- ============================================================================
-- 1. Restore from the pg_dump snapshot taken before this migration.
-- 2. Or recreate the tables from the original `sql/` files (none of which
--    are in this repo for the dropped PMS tables — they only existed in
--    the original PMS repo state).
-- ============================================================================
