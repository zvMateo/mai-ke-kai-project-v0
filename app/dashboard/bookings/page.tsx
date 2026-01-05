import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogoutButton } from "@/components/auth/logout-button"
import { Calendar, ChevronLeft } from "lucide-react"
import { format } from "date-fns"

const statusLabels: Record<string, string> = {
  pending_payment: "Pendiente de Pago",
  confirmed: "Confirmada",
  checked_in: "En Estancia",
  checked_out: "Completada",
  cancelled: "Cancelada",
  no_show: "No Show",
}

const statusColors: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  checked_in: "bg-blue-100 text-blue-800",
  checked_out: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-orange-100 text-orange-800",
}

async function getUserBookings(userId: string) {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      booking_rooms (
        rooms (name, type)
      )
    `)
    .eq("user_id", userId)
    .order("check_in", { ascending: false })

  return bookings || []
}

export default async function UserBookingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const bookings = await getUserBookings(user.id)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/mai-20ke-20kai-20-20isotipo-20-20original.png"
                alt="Mai Ke Kai"
                width={32}
                height={32}
              />
              <span className="font-heading font-semibold text-primary hidden sm:block">Mai Ke Kai</span>
            </Link>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-3xl font-bold">Mis Reservas</h1>
              <p className="text-muted-foreground">Historial completo de tus estancias</p>
            </div>
            <Link href="/booking">
              <Button>Nueva Reserva</Button>
            </Link>
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Sin reservas</h3>
                <p className="text-muted-foreground mb-4">Aun no has hecho ninguna reserva con nosotros</p>
                <Link href="/booking">
                  <Button>Reservar Ahora</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const nights = Math.ceil(
                  (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) /
                    (1000 * 60 * 60 * 24),
                )

                return (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-primary/10 rounded-lg flex flex-col items-center justify-center text-primary">
                            <span className="text-lg font-bold">{format(new Date(booking.check_in), "d")}</span>
                            <span className="text-xs uppercase">{format(new Date(booking.check_in), "MMM")}</span>
                          </div>
                          <div>
                            <p className="font-semibold">
                              {format(new Date(booking.check_in), "d MMM")} -{" "}
                              {format(new Date(booking.check_out), "d MMM yyyy")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.booking_rooms?.map((br: any) => br.rooms?.name).join(", ")} • {nights} noches
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Reserva #{booking.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-primary">${booking.total_amount?.toFixed(2)}</p>
                            <Badge className={statusColors[booking.status]}>{statusLabels[booking.status]}</Badge>
                          </div>

                          {/* Show check-in link for confirmed bookings */}
                          {booking.status === "confirmed" && (
                            <Link href={`/check-in/${booking.id}`}>
                              <Button variant="outline" size="sm">
                                Check-in Online
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
