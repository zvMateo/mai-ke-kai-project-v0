import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { BookingDetailsView } from "@/components/admin/booking-details-view"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BookingDetailsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      users (*),
      booking_rooms (
        *,
        rooms (name, type, amenities),
        beds (bed_number, bed_type)
      ),
      booking_services (
        *,
        services (name, category, price)
      ),
      check_in_data (*)
    `)
    .eq("id", id)
    .single()

  if (error || !booking) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <BookingDetailsView booking={booking} />
    </div>
  )
}
