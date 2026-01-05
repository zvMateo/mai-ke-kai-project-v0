-- Create Admin User for Testing
-- This script creates an admin user in Supabase Auth and links it to the users table

-- IMPORTANT: Replace these values before running:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" 
-- 3. Create a user with:
--    Email: admin@maikekai.com (or your preferred email)
--    Password: YourSecurePassword123!
-- 4. Copy the UUID from the created user
-- 5. Replace 'YOUR-UUID-HERE' below with that UUID

-- After creating the user in Supabase Auth, run this SQL to set the role:

-- Update existing user to admin role (if user was created through signup)
UPDATE users 
SET role = 'admin'
WHERE email = 'admin@maikekai.com';

-- OR if the user doesn't exist in users table yet, insert them:
INSERT INTO users (id, email, full_name, role, created_at)
VALUES (
  'YOUR-UUID-HERE', -- Replace with UUID from Supabase Auth
  'admin@maikekai.com', -- Your admin email
  'Admin User',
  'admin',
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';

-- Verify the admin user was created
SELECT id, email, full_name, role, created_at 
FROM users 
WHERE role = 'admin';
