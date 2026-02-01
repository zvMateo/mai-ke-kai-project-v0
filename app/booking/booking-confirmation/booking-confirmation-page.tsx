"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { BookingConfirmation } from "@/components/booking/booking-confirmation"
import { createClient } from "@/lib/supabase/client"
import type { BookingData } from "@/components/booking/booking-flow"
import { getBookingByIdPublic } from "@/lib/actions/bookings"

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

    let isMounted = true
    let retryCount = 0
    const maxRetries = 5

    async function fetchBookingData() {
      try {
        // Loop for retries
        while (retryCount < maxRetries) {
          if (!isMounted) return

          // Use Server Action to bypass RLS
          const booking = await getBookingByIdPublic(bookingId!)
          
          // If we found the booking, process it
          if (booking) {
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
                country: "BR",
              },
            })
            setLoading(false)
            return
          }

          // If no booking found, wait and retry
          retryCount++
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
          }
        }

        // If we exit the loop, we didn't find the booking
        throw new Error("Booking not found after retries. It might take a few minutes to appear.")

      } catch (err: any) {
        if (!isMounted) return
        console.error("Error fetching booking:", err)
        setError(err.message || "Failed to load booking details")
        setLoading(false)
      }
    }

    fetchBookingData()
    
    return () => { isMounted = false }
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
