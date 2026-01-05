import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { CheckInForm } from "@/components/check-in/check-in-form"

interface PageProps {
  params: Promise<{ bookingId: string }>
}

export default async function OnlineCheckInPage({ params }: PageProps) {
  const { bookingId } = await params
  const supabase = await createClient()

  // Get booking with user and check-in data
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      users (*),
      check_in_data (*),
      booking_rooms (
        *,
        rooms (name, type)
      )
    `)
    .eq("id", bookingId)
    .single()

  if (error || !booking) {
    notFound()
  }

  // Check if check-in is already completed
  if (booking.check_in_data?.completed_at) {
    redirect(`/check-in/${bookingId}/complete`)
  }

  // Check if booking is valid for check-in
  const today = new Date().toISOString().split("T")[0]
  const checkInDate = booking.check_in
  const checkOutDate = booking.check_out

  const canCheckIn = booking.status === "confirmed" || booking.status === "pending_payment"

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <CheckInForm
            booking={booking}
            user={booking.users}
            checkInData={booking.check_in_data}
            canCheckIn={canCheckIn}
          />
        </div>
      </div>
    </div>
  )
}
