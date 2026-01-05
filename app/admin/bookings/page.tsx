import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { format } from "date-fns"

const statusColors: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  checked_in: "bg-blue-100 text-blue-800",
  checked_out: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-orange-100 text-orange-800",
}

async function getBookings() {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      users (
        full_name,
        email
      ),
      booking_rooms (
        rooms (name)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  return bookings || []
}

export default async function BookingsPage() {
  const bookings = await getBookings()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Reservas</h1>
          <p className="text-muted-foreground">Gestiona todas las reservaciones</p>
        </div>
        <Link href="/admin/bookings/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Reserva
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre o email..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Todos
              </Button>
              <Button variant="outline" size="sm">
                Rango de Fechas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay reservas aun</p>
              <p className="text-sm text-muted-foreground mt-1">
                Las reservas apareceran aqui cuando los huespedes hagan reservaciones
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Huesped</TableHead>
                    <TableHead>Habitacion</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.users?.full_name || "Guest"}</p>
                          <p className="text-sm text-muted-foreground">{booking.users?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {booking.booking_rooms?.map((br: any) => br.rooms?.name).join(", ") || "-"}
                        </p>
                      </TableCell>
                      <TableCell>{format(new Date(booking.check_in), "d MMM")}</TableCell>
                      <TableCell>{format(new Date(booking.check_out), "d MMM")}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[booking.status]}>
                          {booking.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>${booking.total_amount?.toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{booking.source}</TableCell>
                      <TableCell>
                        <Link href={`/admin/bookings/${booking.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
