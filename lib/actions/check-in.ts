"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { CheckInData } from "@/types/database"

// Get check-in data for a booking
export async function getCheckInData(bookingId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("check_in_data").select("*").eq("booking_id", bookingId).single()

  if (error) {
    console.error("Error fetching check-in data:", error)
    return null
  }

  return data as CheckInData
}

// Update check-in data (guest submission)
export async function updateCheckInData(
  bookingId: string,
  data: {
    passportPhotoUrl?: string
    signatureUrl?: string
    termsAccepted?: boolean
  },
) {
  const supabase = await createClient()

  const updateData: any = {}
  if (data.passportPhotoUrl) updateData.passport_photo_url = data.passportPhotoUrl
  if (data.signatureUrl) updateData.signature_url = data.signatureUrl
  if (data.termsAccepted !== undefined) updateData.terms_accepted = data.termsAccepted

  // Check if all required fields are now complete
  const { data: existing } = await supabase.from("check_in_data").select("*").eq("booking_id", bookingId).single()

  const merged = { ...existing, ...updateData }
  if (merged.passport_photo_url && merged.terms_accepted) {
    updateData.completed_at = new Date().toISOString()
  }

  const { data: checkInData, error } = await supabase
    .from("check_in_data")
    .update(updateData)
    .eq("booking_id", bookingId)
    .select()
    .single()

  if (error) {
    console.error("Error updating check-in data:", error)
    throw new Error("Failed to update check-in data")
  }

  return checkInData as CheckInData
}

// Update guest passport info
export async function updateGuestPassportInfo(data: {
  passportNumber: string
  passportExpiry: string
  nationality: string
  dateOfBirth: string
  emergencyContact?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("users")
    .update({
      passport_number: data.passportNumber,
      passport_expiry: data.passportExpiry,
      nationality: data.nationality,
      date_of_birth: data.dateOfBirth,
      emergency_contact: data.emergencyContact,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating passport info:", error)
    throw new Error("Failed to update passport info")
  }

  revalidatePath("/dashboard")
  return { success: true }
}

// Admin: Complete check-in process
export async function completeCheckIn(bookingId: string) {
  const supabase = await createClient()

  // Verify check-in data is complete
  const { data: checkInData } = await supabase.from("check_in_data").select("*").eq("booking_id", bookingId).single()

  if (!checkInData?.terms_accepted) {
    throw new Error("Check-in data incomplete")
  }

  // Update booking status
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "checked_in",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  if (error) {
    console.error("Error completing check-in:", error)
    throw new Error("Failed to complete check-in")
  }

  revalidatePath("/admin/bookings")
  return { success: true }
}

// Admin: Complete check-out process
export async function completeCheckOut(bookingId: string) {
  const supabase = await createClient()

  // Get booking for loyalty points
  const { data: booking } = await supabase.from("bookings").select("user_id, total_amount").eq("id", bookingId).single()

  if (!booking) throw new Error("Booking not found")

  // Update booking status
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "checked_out",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  if (error) {
    console.error("Error completing check-out:", error)
    throw new Error("Failed to complete check-out")
  }

  // Award loyalty points (1 point per dollar spent)
  const points = Math.floor(booking.total_amount)

  if (points > 0) {
    // Add transaction
    await supabase.from("loyalty_transactions").insert({
      user_id: booking.user_id,
      points,
      description: `Estancia completada - Reserva #${bookingId.slice(0, 8)}`,
      booking_id: bookingId,
    })

    // Update user points
    const { data: user } = await supabase.from("users").select("loyalty_points").eq("id", booking.user_id).single()

    if (user) {
      await supabase
        .from("users")
        .update({ loyalty_points: user.loyalty_points + points })
        .eq("id", booking.user_id)
    }
  }

  revalidatePath("/admin/bookings")
  return { success: true, pointsAwarded: points }
}
