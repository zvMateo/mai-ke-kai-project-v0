import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, CalendarDays, MapPin, Clock, Wifi, Coffee } from "lucide-react"
import { format } from "date-fns"

interface PageProps {
  params: Promise<{ bookingId: string }>
}

export default async function CheckInCompletePage({ params }: PageProps) {
  const { bookingId } = await params
  const supabase = await createClient()

  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      users (full_name),
      booking_rooms (rooms (name))
    `)
    .eq("id", bookingId)
    .single()

  if (!booking) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Check-in Completado</h1>
          <p className="text-muted-foreground mb-8">Bienvenido a Mai Ke Kai, {booking.users?.full_name}!</p>

          {/* Booking Summary */}
          <Card className="border-0 shadow-xl mb-8 text-left">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <CalendarDays className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {format(new Date(booking.check_in), "EEEE, d MMMM")} -{" "}
                    {format(new Date(booking.check_out), "d MMMM yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.booking_rooms?.map((br: any) => br.rooms?.name).join(", ")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 pb-4 border-b">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Horarios</p>
                  <p className="text-sm text-muted-foreground">Check-out: 11:00 AM | Recepcion: 24 horas</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Mai Ke Kai Surf House</p>
                  <p className="text-sm text-muted-foreground">Playa Tamarindo, Guanacaste, Costa Rica</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities Info */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Informacion Util</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-left">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-primary" />
                  <span>WiFi: MaiKeKai_Guest</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-primary" />
                  <span>Desayuno: 7-10 AM</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">Password WiFi: surfpura2024</p>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button>Ver Mis Reservas</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Volver al Inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
