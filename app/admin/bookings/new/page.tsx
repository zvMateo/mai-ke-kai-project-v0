import { createClient } from "@/lib/supabase/server"
import { ManualBookingForm } from "@/components/admin/manual-booking-form"

async function getRoomsAndServices() {
  const supabase = await createClient()

  const [roomsResult, servicesResult] = await Promise.all([
    supabase.from("rooms").select("*, beds(*)").eq("is_active", true),
    supabase.from("services").select("*").eq("is_active", true),
  ])

  return {
    rooms: roomsResult.data || [],
    services: servicesResult.data || [],
  }
}

export default async function NewBookingPage() {
  const { rooms, services } = await getRoomsAndServices()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Nueva Reserva</h1>
        <p className="text-muted-foreground">Crear reserva manual (walk-in, telefono, OTA)</p>
      </div>

      <ManualBookingForm rooms={rooms} services={services} />
    </div>
  )
}
