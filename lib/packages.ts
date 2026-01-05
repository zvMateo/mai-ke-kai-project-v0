// Surf + Stay Package definitions

export interface SurfPackage {
  id: string
  name: string
  tagline: string
  nights: number
  surfLessons: number
  roomType: "dorm" | "private"
  includes: string[]
  price: number
  originalPrice: number
  savings: number
  popular: boolean
  forTwo?: boolean
}

export const SURF_PACKAGES: SurfPackage[] = [
  {
    id: "surf-starter",
    name: "Surf Starter",
    tagline: "Perfecto para principiantes",
    nights: 5,
    surfLessons: 3,
    roomType: "dorm",
    includes: [
      "5 noches en dormitorio compartido",
      "3 clases de surf con instructor",
      "Alquiler de tabla y lycra incluido",
      "Desayuno diario",
      "WiFi gratis",
    ],
    price: 299,
    originalPrice: 375,
    savings: 76,
    popular: false,
  },
  {
    id: "surf-explorer",
    name: "Surf Explorer",
    tagline: "El mas popular",
    nights: 7,
    surfLessons: 5,
    roomType: "dorm",
    includes: [
      "7 noches en dormitorio compartido",
      "5 clases de surf con instructor",
      "Alquiler de tabla ilimitado",
      "Desayuno diario",
      "1 tour de catamaran incluido",
      "Transfer aeropuerto ida",
      "WiFi gratis",
    ],
    price: 449,
    originalPrice: 580,
    savings: 131,
    popular: true,
  },
  {
    id: "surf-pro",
    name: "Surf Pro",
    tagline: "Experiencia premium",
    nights: 7,
    surfLessons: 5,
    roomType: "private",
    includes: [
      "7 noches en habitacion privada",
      "5 clases de surf (grupos reducidos)",
      "Video analisis de tu surf",
      "Alquiler de tabla ilimitado",
      "Desayuno y cena diarios",
      "Tour de catamaran + snorkel",
      "Transfer aeropuerto ida y vuelta",
      "Late check-out garantizado",
    ],
    price: 799,
    originalPrice: 1050,
    savings: 251,
    popular: false,
  },
  {
    id: "couples-retreat",
    name: "Couples Retreat",
    tagline: "Romantico surf getaway",
    nights: 5,
    surfLessons: 3,
    roomType: "private",
    includes: [
      "5 noches en habitacion privada",
      "3 clases de surf para parejas",
      "Tour de catamaran al atardecer",
      "Cena romantica en la playa",
      "Desayuno diario",
      "Botella de vino de bienvenida",
      "Transfer aeropuerto",
    ],
    price: 599,
    originalPrice: 780,
    savings: 181,
    popular: false,
    forTwo: true,
  },
]

export function getPackageById(id: string): SurfPackage | undefined {
  return SURF_PACKAGES.find((p) => p.id === id)
}

// Calculate package price with seasonal adjustments
export function calculatePackagePrice(
  packageId: string,
  checkInDate: Date,
): {
  basePrice: number
  seasonalAdjustment: number
  total: number
} {
  const pkg = getPackageById(packageId)
  if (!pkg) {
    return { basePrice: 0, seasonalAdjustment: 0, total: 0 }
  }

  // Check season
  const month = checkInDate.getMonth() + 1
  let seasonMultiplier = 1

  // High season: Dec 27 - Apr 30
  if ((month === 12 && checkInDate.getDate() >= 27) || month === 1 || month === 2 || month === 3 || month === 4) {
    seasonMultiplier = 1.15 // 15% increase in high season
  }
  // Low season: Sep - Oct
  else if (month === 9 || month === 10) {
    seasonMultiplier = 0.9 // 10% discount in low season
  }

  const basePrice = pkg.price
  const adjustedPrice = Math.round(basePrice * seasonMultiplier)
  const seasonalAdjustment = adjustedPrice - basePrice

  return {
    basePrice,
    seasonalAdjustment,
    total: adjustedPrice,
  }
}
