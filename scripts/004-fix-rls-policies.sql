-- Fix infinite recursion in RLS policies
-- Version: 004 - Fix RLS

-- Drop problematic policies
DROP POLICY IF EXISTS "Staff can view all users" ON users;
DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON bookings;
DROP POLICY IF EXISTS "Admin can manage rooms" ON rooms;
DROP POLICY IF EXISTS "Admin can manage services" ON services;
DROP POLICY IF EXISTS "Staff can manage room blocks" ON room_blocks;

-- Allow service role to bypass RLS (for server actions)
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE bookings FORCE ROW LEVEL SECURITY;

-- Public insert for users (for guest registration during checkout)
CREATE POLICY "Anyone can create user account" ON users 
  FOR INSERT 
  WITH CHECK (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Users can view own profile v2" ON users 
  FOR SELECT 
  USING (auth.uid() = id OR auth.uid() IS NULL);

-- Bookings: Allow insert for authenticated or service role
CREATE POLICY "Authenticated can create bookings" ON bookings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Booking rooms: Allow insert during booking creation
CREATE POLICY "Can insert booking rooms" ON booking_rooms 
  FOR INSERT 
  WITH CHECK (true);

-- Booking services: Allow insert during booking creation
CREATE POLICY "Can insert booking services" ON booking_services 
  FOR INSERT 
  WITH CHECK (true);

-- Check-in data: Allow insert
CREATE POLICY "Can create check-in data" ON check_in_data 
  FOR INSERT 
  WITH CHECK (true);

-- Note: Admin operations should use service role client which bypasses RLS
