// Re-export all types
export * from "./database"

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// Booking Flow Types
export interface AvailabilitySearchParams {
  checkIn: string
  checkOut: string
  guests: number
}

export interface AvailableRoom {
  room: import("./database").Room
  availableBeds: number
  pricePerNight: number
  totalPrice: number
}

export interface CartItem {
  type: "room" | "service"
  id: string
  name: string
  quantity: number
  price: number
  details?: {
    checkIn?: string
    checkOut?: string
    bedId?: string
    scheduledDate?: string
  }
}

export interface BookingCart {
  items: CartItem[]
  subtotal: number
  taxes: number
  total: number
}

// Pricing Calculation
export interface PriceBreakdown {
  nights: number
  basePrice: number
  seasonAdjustment: number
  leadTimeDiscount: number
  subtotal: number
  taxes: number
  total: number
}
