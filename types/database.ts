// Mai Ke Kai Database Types
//
// Phase 0 cleanup removed PMS-specific types (Booking, BookingRoom,
// BookingService, SeasonPricing, SeasonDate, RoomAvailability, CheckInData,
// LoyaltyTransaction, PaymentWebhook, payment status enums).
// Tab.Travel owns booking/payment data externally.
//
// Marketing-content tables (rooms, beds, services, service_categories,
// surf_packages) keep their types — the public landing reads from them.

export type RoomType = "dorm" | "private" | "family" | "female";
export type SellUnit = "bed" | "room" | "group";
export type UserRole = "guest" | "admin";

// Service Category — stored in DB for full customization
export interface ServiceCategoryEntity {
  id: string;
  name: string; // Display name (e.g., "Surf Lessons")
  slug: string; // URL-friendly identifier (e.g., "surf")
  description: string | null;
  icon: string | null; // Lucide icon name (e.g., "waves", "car", "ship")
  color: string | null; // Tailwind color class (e.g., "blue", "orange")
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Type alias for compatibility — category field uses slug string in forms/queries
export type ServiceCategory = string;

// Room / Inventory Types (marketing content)
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

// User Types (admin auth only after PMS cleanup)
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  nationality: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Service / Activity Types (marketing content)
export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory; // Category slug
  category_id?: string; // FK to service_categories.id
  category_data?: ServiceCategoryEntity; // Joined category data
  price: number;
  duration_hours: number | null;
  max_participants: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Surf Package Types (marketing content — the hero product)
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

// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  author_name: string;
  author_avatar_url: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// Gallery Types
export type GalleryCategory =
  | "surf"
  | "rooms"
  | "community"
  | "nature"
  | "lifestyle"
  | "general";

export interface GalleryItem {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  category: GalleryCategory;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Testimonial Types
export interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  text: string;
  avatar_url: string | null;
  package_id: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// About Page Types
export interface AboutTeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  avatar_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface AboutTimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
}

export interface SiteContent {
  key: string;
  value: string;
  updated_at: string;
}

// Newsletter Types
export type NewsletterStatus = "subscribed" | "unsubscribed";
export type NewsletterCampaignStatus = "draft" | "sent";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  full_name: string | null;
  locale: string | null;
  country_code: string | null;
  timezone: string | null;
  location_consent: boolean;
  geo_lat: number | null;
  geo_lng: number | null;
  geo_accuracy_meters: number | null;
  geo_captured_at: string | null;
  status: NewsletterStatus;
  unsubscribe_token: string;
  source: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsletterCampaign {
  id: string;
  title: string;
  subject: string;
  content_html: string;
  preview_text: string | null;
  template_type:
    | "promo"
    | "news"
    | "cta"
    | "surf_camp"
    | "accommodation"
    | "informative";
  audience_country_code: string | null;
  status: NewsletterCampaignStatus;
  recipients_count: number;
  successful_sends: number;
  failed_sends: number;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
