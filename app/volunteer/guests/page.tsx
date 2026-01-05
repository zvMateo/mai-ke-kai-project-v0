import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Phone, Mail, Globe } from "lucide-react"
import { format, differenceInDays } from "date-fns"

async function getCurrentGuests() {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `
      id,
      check_in,
      check_out,
      guests_count,
      status,
      special_requests,
      users (id, full_name, email, phone, nationality),
      booking_rooms (rooms (name, type))
    `,
    )
    .eq("status", "checked_in")
    .order("check_out", { ascending: true })

  return bookings || []
}

export default async function VolunteerGuestsPage() {
  const currentGuests = await getCurrentGuests()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Current Guests</h2>
        <p className="text-muted-foreground">{currentGuests.length} booking(s) currently in house</p>
      </div>

      {currentGuests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No guests currently in house</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {currentGuests.map((booking: any) => {
            const daysRemaining = differenceInDays(new Date(booking.check_out), new Date())

            return (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-primary">
                            {(booking.users?.full_name || "G").charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{booking.users?.full_name || "Guest"}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.guests_count} guest(s) •{" "}
                            {booking.booking_rooms?.map((br: any) => br.rooms?.name).join(", ")}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        {booking.users?.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{booking.users.email}</span>
                          </div>
                        )}
                        {booking.users?.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{booking.users.phone}</span>
                          </div>
                        )}
                        {booking.users?.nationality && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="w-4 h-4" />
                            <span>{booking.users.nationality}</span>
                          </div>
                        )}
                      </div>

                      {booking.special_requests && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            <strong>Notes:</strong> {booking.special_requests}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 min-w-[140px]">
                      <Badge variant={daysRemaining <= 1 ? "destructive" : "secondary"}>
                        {daysRemaining === 0
                          ? "Checkout Today"
                          : daysRemaining === 1
                            ? "Checkout Tomorrow"
                            : `${daysRemaining} nights left`}
                      </Badge>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Check-out:</p>
                        <p className="font-medium">{format(new Date(booking.check_out), "EEE, MMM d")}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
