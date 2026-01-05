-- Mai Ke Kai Surf House - Seed Data
-- Version: 002 - Initial Seed

-- =====================
-- INSERT ROOMS
-- =====================
INSERT INTO rooms (id, name, type, capacity, sell_unit, description, amenities) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Dormitorio Compartido', 'dorm', 10, 'bed', 
   'Spacious shared dormitory with ocean vibes. Perfect for solo travelers and surf enthusiasts.',
   ARRAY['Lockers', 'Reading Lights', 'USB Charging', 'Air Conditioning', 'Shared Bathroom']),
  
  ('22222222-2222-2222-2222-222222222222', 'Cuarto Privado', 'private', 4, 'room',
   'Private room for up to 4 guests. Ideal for couples or small groups seeking privacy.',
   ARRAY['Private Bathroom', 'Air Conditioning', 'Ocean View', 'Mini Fridge', 'Safe Box']),
  
  ('33333333-3333-3333-3333-333333333333', 'Cuarto Familiar', 'family', 4, 'bed',
   'Flexible family room. Book individual beds or the entire room for your group.',
   ARRAY['Private Bathroom', 'Air Conditioning', 'Balcony', 'Kitchenette']),
  
  ('44444444-4444-4444-4444-444444444444', 'Cuarto Femenino', 'female', 4, 'bed',
   'Women-only dormitory. Safe and comfortable space for female travelers.',
   ARRAY['Lockers', 'Vanity Area', 'Hair Dryer', 'Air Conditioning', 'Private Bathroom']);

-- =====================
-- INSERT BEDS
-- =====================
-- Dorm beds (10)
INSERT INTO beds (room_id, bed_number, bed_type) VALUES
  ('11111111-1111-1111-1111-111111111111', 1, 'bunk_bottom'),
  ('11111111-1111-1111-1111-111111111111', 2, 'bunk_top'),
  ('11111111-1111-1111-1111-111111111111', 3, 'bunk_bottom'),
  ('11111111-1111-1111-1111-111111111111', 4, 'bunk_top'),
  ('11111111-1111-1111-1111-111111111111', 5, 'bunk_bottom'),
  ('11111111-1111-1111-1111-111111111111', 6, 'bunk_top'),
  ('11111111-1111-1111-1111-111111111111', 7, 'bunk_bottom'),
  ('11111111-1111-1111-1111-111111111111', 8, 'bunk_top'),
  ('11111111-1111-1111-1111-111111111111', 9, 'bunk_bottom'),
  ('11111111-1111-1111-1111-111111111111', 10, 'bunk_top');

-- Private room beds (4 - sold as room)
INSERT INTO beds (room_id, bed_number, bed_type) VALUES
  ('22222222-2222-2222-2222-222222222222', 1, 'double'),
  ('22222222-2222-2222-2222-222222222222', 2, 'double');

-- Family room beds (4)
INSERT INTO beds (room_id, bed_number, bed_type) VALUES
  ('33333333-3333-3333-3333-333333333333', 1, 'double'),
  ('33333333-3333-3333-3333-333333333333', 2, 'single'),
  ('33333333-3333-3333-3333-333333333333', 3, 'single');

-- Female dorm beds (4)
INSERT INTO beds (room_id, bed_number, bed_type) VALUES
  ('44444444-4444-4444-4444-444444444444', 1, 'single'),
  ('44444444-4444-4444-4444-444444444444', 2, 'single'),
  ('44444444-4444-4444-4444-444444444444', 3, 'single'),
  ('44444444-4444-4444-4444-444444444444', 4, 'single');

-- =====================
-- INSERT SEASON PRICING
-- =====================
-- Dorm pricing
INSERT INTO season_pricing (room_id, season, base_price, rack_rate, competitive_rate, last_minute_rate) VALUES
  ('11111111-1111-1111-1111-111111111111', 'high', 35.00, 35.00, 31.50, 28.00),
  ('11111111-1111-1111-1111-111111111111', 'mid', 28.00, 28.00, 25.20, 22.40),
  ('11111111-1111-1111-1111-111111111111', 'low', 22.00, 22.00, 19.80, 17.60);

-- Private room pricing (per room)
INSERT INTO season_pricing (room_id, season, base_price, rack_rate, competitive_rate, last_minute_rate) VALUES
  ('22222222-2222-2222-2222-222222222222', 'high', 150.00, 150.00, 135.00, 120.00),
  ('22222222-2222-2222-2222-222222222222', 'mid', 120.00, 120.00, 108.00, 96.00),
  ('22222222-2222-2222-2222-222222222222', 'low', 95.00, 95.00, 85.50, 76.00);

-- Family room pricing (per bed)
INSERT INTO season_pricing (room_id, season, base_price, rack_rate, competitive_rate, last_minute_rate) VALUES
  ('33333333-3333-3333-3333-333333333333', 'high', 40.00, 40.00, 36.00, 32.00),
  ('33333333-3333-3333-3333-333333333333', 'mid', 32.00, 32.00, 28.80, 25.60),
  ('33333333-3333-3333-3333-333333333333', 'low', 26.00, 26.00, 23.40, 20.80);

-- Female dorm pricing
INSERT INTO season_pricing (room_id, season, base_price, rack_rate, competitive_rate, last_minute_rate) VALUES
  ('44444444-4444-4444-4444-444444444444', 'high', 32.00, 32.00, 28.80, 25.60),
  ('44444444-4444-4444-4444-444444444444', 'mid', 26.00, 26.00, 23.40, 20.80),
  ('44444444-4444-4444-4444-444444444444', 'low', 20.00, 20.00, 18.00, 16.00);

-- =====================
-- INSERT SEASON DATES
-- =====================
INSERT INTO season_dates (season, start_date, end_date) VALUES
  ('high', '12-27', '04-30'),
  ('low', '09-01', '10-31');
-- Mid season is the default (rest of year)

-- =====================
-- INSERT SERVICES
-- =====================
INSERT INTO services (name, description, category, price, duration_hours, max_participants) VALUES
  ('Surf Lesson', 'Professional surf lesson with certified instructor. All equipment included.', 'surf', 60.00, 2.0, 6),
  ('Surf Photography', 'Get amazing photos of your surf session. Digital delivery same day.', 'surf', 45.00, 2.0, NULL),
  ('Video Analysis', 'Record your session and review with a coach to improve technique.', 'surf', 35.00, 1.0, 1),
  ('Catamaran Tour', 'Full day catamaran adventure with snorkeling and lunch included.', 'tour', 95.00, 6.0, 20),
  ('Scuba Diving', 'Discover the underwater world with certified PADI instructors.', 'tour', 120.00, 4.0, 8),
  ('Snorkeling Trip', 'Explore coral reefs and tropical fish. Equipment included.', 'tour', 55.00, 3.0, 12),
  ('Turtle Nesting Tour', 'Seasonal night tour to witness sea turtles nesting (Jul-Nov).', 'tour', 40.00, 3.0, 10),
  ('Airport Shuttle - Liberia', 'Private transfer from/to Liberia Airport (LIR).', 'transport', 85.00, 1.5, 6),
  ('Airport Shuttle - San Jose', 'Private transfer from/to San Jose Airport (SJO).', 'transport', 180.00, 4.0, 6),
  ('Beach Shuttle', 'Transport to nearby beaches and surf spots.', 'transport', 25.00, 0.5, 8);
