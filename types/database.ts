// Mai Ke Kai Database Types

export type Season = "high" | "low" | "mid";
export type RoomType = "dorm" | "private" | "family" | "female";
export type SellUnit = "bed" | "room" | "group";
export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "no_show";
export type PaymentStatus = "pending" | "partial" | "paid" | "refunded";
export type UserRole = "guest" | "volunteer" | "staff" | "admin";
export type ServiceCategory = "surf" | "tour" | "transport" | "other";

// Room/Inventory Types
export interface Room {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  sell_unit: SellUnit;
  description: string | null;
  amenities: string[];
  main_image: string | null;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bed {
  id: string;
  room_id: string;
  bed_number: number;
  bed_type: "single" | "double" | "bunk_top" | "bunk_bottom";
  is_active: boolean;
}

// Pricing Types
export interface SeasonPricing {
  id: string;
  room_id: string;
  season: Season;
  base_price: number; // Price per night per unit (bed or room)
  rack_rate: number; // Standard rate (60+ days)
  competitive_rate: number; // Discounted rate (<60 days)
  last_minute_rate: number; // Last minute (<10 days)
  valid_from: string;
  valid_to: string;
}

export interface SeasonDate {
  id: string;
  season: Season;
  start_date: string; // MM-DD format
  end_date: string; // MM-DD format
  year: number | null; // null = recurring every year
}

// User Types
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  nationality: string | null;
  passport_number: string | null;
  passport_expiry: string | null;
  date_of_birth: string | null;
  emergency_contact: string | null;
  role: UserRole;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
}

// Booking Types
export interface Booking {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  paid_amount: number;
  greenpay_payment_id: string | null;
  greenpay_transaction_id: string | null;
  special_requests: string | null;
  source: "direct" | "walk_in" | "phone" | "ota";
  created_at: string;
  updated_at: string;
}

export interface BookingRoom {
  id: string;
  booking_id: string;
  room_id: string;
  bed_id: string | null; // null if booking whole room
  price_per_night: number;
}

// Extras/Services Types
export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  price: number;
  duration_hours: number | null;
  max_participants: number | null;
  image_url: string | null;
  is_active: boolean;
}

export interface BookingService {
  id: string;
  booking_id: string;
  service_id: string;
  quantity: number;
  scheduled_date: string | null;
  scheduled_time: string | null;
  price_at_booking: number;
  notes: string | null;
}

// Availability Types
export interface RoomAvailability {
  date: string;
  room_id: string;
  available_beds: number;
  total_beds: number;
  is_blocked: boolean;
  block_reason: string | null;
}

// Check-in Types
export interface CheckInData {
  id: string;
  booking_id: string;
  passport_photo_url: string | null;
  signature_url: string | null;
  terms_accepted: boolean;
  completed_at: string | null;
}

// Loyalty Types
export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points: number; // positive = earned, negative = redeemed
  description: string;
  booking_id: string | null;
  created_at: string;
}

// Surf Package Types
export interface SurfPackage {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  nights: number;
  surf_lessons: number;
  room_type: RoomType;
  includes: string[];
  price: number;
  original_price: number | null;
  image_url: string | null;
  is_popular: boolean;
  is_for_two: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
