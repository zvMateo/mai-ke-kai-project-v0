-- Fix the users table role column CHECK constraint
-- This fixes the incorrect syntax in the previous migration

-- First, drop the incorrect CHECK constraint (if it exists)
-- The constraint might have a name like "users_role_check" or similar
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the correct CHECK constraint
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('guest', 'volunteer', 'staff', 'admin'));

-- Update default value if needed
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'guest';

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;
