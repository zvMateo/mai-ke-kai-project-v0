// Mai Ke Kai Constants

export const HOTEL_CONFIG = {
  name: "Mai Ke Kai Surf House",
  tagline: "Surf House",
  capacity: 18,
  currency: "USD",
  timezone: "America/Costa_Rica",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  taxRate: 0.13, // 13% Costa Rica tax
} as const

export const ROOMS = {
  DORM: {
    id: "dorm-shared",
    name: "Dormitorio Compartido",
    capacity: 10,
    type: "dorm",
    sellUnit: "bed",
  },
  PRIVATE: {
    id: "private-4",
    name: "Cuarto Privado",
    capacity: 4,
    type: "private",
    sellUnit: "room",
  },
  FAMILY: {
    id: "family-4",
    name: "Cuarto Familiar/Grupo",
    capacity: 4,
    type: "family",
    sellUnit: "bed", // or group
  },
  FEMALE: {
    id: "female-4",
    name: "Cuarto Femenino",
    capacity: 4,
    type: "female",
    sellUnit: "bed",
  },
} as const

export const SEASONS = {
  HIGH: {
    name: "Alta",
    months: ["12-27", "04-30"], // Dec 27 to Apr 30
    multiplier: 1.3,
  },
  LOW: {
    name: "Baja",
    months: ["09-01", "10-31"], // Sep 1 to Oct 31
    multiplier: 0.8,
  },
  MID: {
    name: "Media",
    multiplier: 1.0,
  },
} as const

export const LEAD_TIME_PRICING = {
  RACK: { minDays: 60, discount: 0 }, // Standard rate
  COMPETITIVE: { minDays: 10, maxDays: 59, discount: 0.1 }, // 10% off
  LAST_MINUTE: { maxDays: 9, discount: 0.2 }, // 20% off
} as const

export const SERVICES = {
  SURF_LESSON: { price: 60, category: "surf" },
  CATAMARAN_TOUR: { price: 95, category: "tour" },
} as const

export const LOYALTY = {
  POINTS_PER_DOLLAR: 10, // Earn 10 points per $1 spent
  POINTS_TO_DOLLAR: 100, // 100 points = $1 redemption
} as const
