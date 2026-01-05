-- Mai Ke Kai Surf House - Database Schema
-- Version: 001 - Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- USERS TABLE
-- =====================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  nationality TEXT,
  passport_number TEXT,
  passport_expiry DATE,
  date_of_birth DATE,
  emergency_contact TEXT,
  role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'staff', 'admin')),
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- ROOMS TABLE
-- =====================
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('dorm', 'private', 'family', 'female')),
  capacity INTEGER NOT NULL,
  sell_unit TEXT NOT NULL CHECK (sell_unit IN ('bed', 'room', 'group')),
  description TEXT,
  amenities TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- BEDS TABLE
-- =====================
CREATE TABLE beds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  bed_number INTEGER NOT NULL,
  bed_type TEXT NOT NULL CHECK (bed_type IN ('single', 'double', 'bunk_top', 'bunk_bottom')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(room_id, bed_number)
);

-- =====================
-- SEASON DATES TABLE
-- =====================
CREATE TABLE season_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season TEXT NOT NULL CHECK (season IN ('high', 'low', 'mid')),
  start_date TEXT NOT NULL, -- MM-DD format
  end_date TEXT NOT NULL, -- MM-DD format
  year INTEGER -- null = recurring every year
);

-- =====================
-- SEASON PRICING TABLE
-- =====================
CREATE TABLE season_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  season TEXT NOT NULL CHECK (season IN ('high', 'low', 'mid')),
  base_price DECIMAL(10, 2) NOT NULL,
  rack_rate DECIMAL(10, 2) NOT NULL,
  competitive_rate DECIMAL(10, 2) NOT NULL,
  last_minute_rate DECIMAL(10, 2) NOT NULL,
  valid_from DATE,
  valid_to DATE,
  UNIQUE(room_id, season)
);

-- =====================
-- BOOKINGS TABLE
-- =====================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  total_amount DECIMAL(10, 2) NOT NULL,
  paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tilopay_payment_id TEXT,
  tilopay_transaction_id TEXT,
  special_requests TEXT,
  source TEXT NOT NULL DEFAULT 'direct' CHECK (source IN ('direct', 'walk_in', 'phone', 'ota')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (check_out > check_in)
);

-- =====================
-- BOOKING ROOMS TABLE
-- =====================
CREATE TABLE booking_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id),
  bed_id UUID REFERENCES beds(id), -- null if booking whole room
  price_per_night DECIMAL(10, 2) NOT NULL
);

-- =====================
-- SERVICES TABLE
-- =====================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('surf', 'tour', 'transport', 'other')),
  price DECIMAL(10, 2) NOT NULL,
  duration_hours DECIMAL(4, 2),
  max_participants INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- =====================
-- BOOKING SERVICES TABLE
-- =====================
CREATE TABLE booking_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  scheduled_date DATE,
  scheduled_time TIME,
  price_at_booking DECIMAL(10, 2) NOT NULL,
  notes TEXT
);

-- =====================
-- ROOM BLOCKS TABLE (for manual blocking)
-- =====================
CREATE TABLE room_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  bed_id UUID REFERENCES beds(id), -- null if blocking whole room
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (end_date >= start_date)
);

-- =====================
-- CHECK-IN DATA TABLE
-- =====================
CREATE TABLE check_in_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  passport_photo_url TEXT,
  signature_url TEXT,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================
-- LOYALTY TRANSACTIONS TABLE
-- =====================
CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  points INTEGER NOT NULL, -- positive = earned, negative = redeemed
  description TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_booking_rooms_booking_id ON booking_rooms(booking_id);
CREATE INDEX idx_booking_rooms_room_id ON booking_rooms(room_id);
CREATE INDEX idx_beds_room_id ON beds(room_id);
CREATE INDEX idx_room_blocks_dates ON room_blocks(start_date, end_date);
CREATE INDEX idx_loyalty_user_id ON loyalty_transactions(user_id);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_in_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_pricing ENABLE ROW LEVEL SECURITY;

-- Public read access for rooms and services
CREATE POLICY "Rooms are viewable by everyone" ON rooms FOR SELECT USING (true);
CREATE POLICY "Beds are viewable by everyone" ON beds FOR SELECT USING (true);
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);
CREATE POLICY "Season dates are viewable by everyone" ON season_dates FOR SELECT USING (true);
CREATE POLICY "Season pricing is viewable by everyone" ON season_pricing FOR SELECT USING (true);

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their booking details
CREATE POLICY "Users can view own booking rooms" ON booking_rooms FOR SELECT 
  USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_rooms.booking_id AND bookings.user_id = auth.uid()));

CREATE POLICY "Users can view own booking services" ON booking_services FOR SELECT 
  USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_services.booking_id AND bookings.user_id = auth.uid()));

-- Users can view their check-in data
CREATE POLICY "Users can view own check-in data" ON check_in_data FOR SELECT 
  USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = check_in_data.booking_id AND bookings.user_id = auth.uid()));
CREATE POLICY "Users can update own check-in data" ON check_in_data FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = check_in_data.booking_id AND bookings.user_id = auth.uid()));

-- Users can view their loyalty transactions
CREATE POLICY "Users can view own loyalty" ON loyalty_transactions FOR SELECT USING (auth.uid() = user_id);

-- Room blocks viewable by authenticated users (for availability)
CREATE POLICY "Room blocks viewable by authenticated" ON room_blocks FOR SELECT USING (auth.uid() IS NOT NULL);

-- Staff/Admin policies (using role from users table)
CREATE POLICY "Staff can view all users" ON users FOR SELECT 
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('staff', 'admin')));

CREATE POLICY "Staff can view all bookings" ON bookings FOR SELECT 
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('staff', 'admin')));

CREATE POLICY "Staff can update bookings" ON bookings FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('staff', 'admin')));

CREATE POLICY "Admin can manage rooms" ON rooms FOR ALL 
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));

CREATE POLICY "Admin can manage services" ON services FOR ALL 
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));

CREATE POLICY "Staff can manage room blocks" ON room_blocks FOR ALL 
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('staff', 'admin')));
