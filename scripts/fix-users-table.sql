-- Fix the users table role column CHECK constraint
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard

-- First, drop any existing incorrect CHECK constraints
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS "users_role_check1";

-- Add the correct CHECK constraint with all allowed roles
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role IN ('guest', 'volunteer', 'staff', 'admin'));

-- Update default value if needed
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'guest';

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;

-- Verify the fix
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'role';
