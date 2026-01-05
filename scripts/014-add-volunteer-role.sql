-- Add volunteer role to users table enum
-- Run this in Supabase SQL Editor

-- Step 1: Update the constraint to allow 'volunteer' role
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('guest', 'volunteer', 'staff', 'admin'));

-- Step 2: Create a function to check if user is volunteer or higher
CREATE OR REPLACE FUNCTION is_volunteer_or_higher(user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM users WHERE id = user_id;
  RETURN user_role IN ('volunteer', 'staff', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Show current users and their roles
SELECT id, email, full_name, role FROM users ORDER BY created_at DESC;
