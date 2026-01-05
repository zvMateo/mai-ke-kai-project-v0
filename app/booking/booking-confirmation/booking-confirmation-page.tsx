"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { BookingConfirmation } from "@/components/booking/booking-confirmation"
import { createClient } from "@/lib/supabase/client"
import type { BookingData } from "@/components/booking/booking-flow"

export function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided")
      setLoading(false)
      return
    }

    async function fetchBookingData() {
      try {
        const supabase = createClient()
        
        const { data: booking, error: bookingError } = await supabase
          .from("bookings")
          .select(`
            *,
            users (full_name, email, phone, nationality),
            booking_rooms (
              rooms (id, name),
              bed_id,
              price_per_night
            ),
            booking_services (
              service_id,
              quantity,
              price_at_booking,
              scheduled_date,
              services (name)
            )
          `)
          .eq("id", bookingId)
          .single()

        if (bookingError) throw bookingError

        if (!booking) throw new Error("Booking not found")

        const checkIn = new Date(booking.check_in)
        const checkOut = new Date(booking.check_out)

        setBookingData({
          checkIn,
          checkOut,
          guests: booking.guests_count,
          rooms: booking.booking_rooms.map((br: any) => ({
            roomId: br.rooms.id,
            roomName: br.rooms.name,
            quantity: 1,
            pricePerNight: br.price_per_night,
            sellUnit: "room" as const,
          })),
          extras: booking.booking_services.map((bs: any) => ({
            serviceId: bs.service_id,
            serviceName: bs.services.name,
            quantity: bs.quantity,
            price: bs.price_at_booking,
            date: bs.scheduled_date,
          })),
          guestInfo: {
            firstName: booking.users.full_name?.split(" ")[0] || "",
            lastName: booking.users.full_name?.split(" ").slice(1).join(" ") || "",
            email: booking.users.email,
            phone: booking.users.phone || "",
            nationality: booking.users.nationality || "",
          },
        })
      } catch (err) {
        console.error("Error fetching booking:", err)
        setError("Failed to load booking details")
      } finally {
        setLoading(false)
      }
    }

    fetchBookingData()
  }, [bookingId])

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-8" />
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !bookingData) {
    return (
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-heading text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground">{error || "Unable to load booking"}</p>
        </div>
      </div>
    )
  }

  return <BookingConfirmation bookingId={bookingId!} bookingData={bookingData} />
}
