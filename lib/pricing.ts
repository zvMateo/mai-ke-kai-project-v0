import { SEASONS, LEAD_TIME_PRICING, HOTEL_CONFIG } from "./constants"
import type { Season, PriceBreakdown } from "@/types"

export function getSeason(date: Date): Season {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const mmdd = `${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`

  // High season: Dec 27 - Apr 30
  if ((month === 12 && day >= 27) || month === 1 || month === 2 || month === 3 || (month === 4 && day <= 30)) {
    return "high"
  }

  // Low season: Sep 1 - Oct 31
  if (month === 9 || month === 10) {
    return "low"
  }

  // Mid season: rest of year
  return "mid"
}

export function getSeasonMultiplier(season: Season): number {
  switch (season) {
    case "high":
      return SEASONS.HIGH.multiplier
    case "low":
      return SEASONS.LOW.multiplier
    default:
      return SEASONS.MID.multiplier
  }
}

export function getLeadTimeDiscount(checkInDate: Date): number {
  const today = new Date()
  const diffTime = checkInDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays >= LEAD_TIME_PRICING.RACK.minDays) {
    return LEAD_TIME_PRICING.RACK.discount
  } else if (diffDays >= LEAD_TIME_PRICING.COMPETITIVE.minDays) {
    return LEAD_TIME_PRICING.COMPETITIVE.discount
  } else {
    return LEAD_TIME_PRICING.LAST_MINUTE.discount
  }
}

export function calculatePrice(basePrice: number, checkIn: Date, checkOut: Date): PriceBreakdown {
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

  // Calculate average season multiplier across all nights
  let totalSeasonMultiplier = 0
  const currentDate = new Date(checkIn)

  for (let i = 0; i < nights; i++) {
    const season = getSeason(currentDate)
    totalSeasonMultiplier += getSeasonMultiplier(season)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  const avgSeasonMultiplier = totalSeasonMultiplier / nights
  const seasonAdjustment = basePrice * nights * (avgSeasonMultiplier - 1)

  // Lead time discount
  const leadTimeDiscount = getLeadTimeDiscount(checkIn)
  const priceBeforeDiscount = basePrice * nights + seasonAdjustment
  const discountAmount = priceBeforeDiscount * leadTimeDiscount

  const subtotal = priceBeforeDiscount - discountAmount
  const taxes = subtotal * HOTEL_CONFIG.taxRate
  const total = subtotal + taxes

  return {
    nights,
    basePrice: basePrice * nights,
    seasonAdjustment,
    leadTimeDiscount: discountAmount,
    subtotal,
    taxes,
    total,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: HOTEL_CONFIG.currency,
  }).format(amount)
}
