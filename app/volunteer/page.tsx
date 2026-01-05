import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, LogIn, LogOut, Bed, Coffee } from "lucide-react"
import { format } from "date-fns"

async function getTodayStats() {
  const supabase = await createClient()
  const today = format(new Date(), "yyyy-MM-dd")

  // Get arrivals today
  const { data: arrivals } = await supabase
    .from("bookings")
    .select(
      `
      id,
      check_in,
      guests_count,
      status,
      users (full_name, email),
      booking_rooms (rooms (name))
    `,
    )
    .eq("check_in", today)
    .in("status", ["confirmed", "checked_in"])

  // Get departures today
  const { data: departures } = await supabase
    .from("bookings")
    .select(
      `
      id,
      check_out,
      guests_count,
      status,
      users (full_name, email),
      booking_rooms (rooms (name))
    `,
    )
    .eq("check_out", today)
    .in("status", ["checked_in", "checked_out"])

  // Get current guests (checked in)
  const { data: currentGuests } = await supabase
    .from("bookings")
    .select(
      `
      id,
      guests_count,
      users (full_name)
    `,
    )
    .eq("status", "checked_in")

  // Get total beds occupied
  const totalGuestsCount = currentGuests?.reduce((sum, b) => sum + b.guests_count, 0) || 0

  return {
    arrivals: arrivals || [],
    departures: departures || [],
    currentGuestsCount: currentGuests?.length || 0,
    totalGuestsCount,
  }
}

export default async function VolunteerDashboard() {
  const stats = await getTodayStats()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Today's Overview</h2>
        <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <LogIn className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.arrivals.length}</p>
                <p className="text-xs text-muted-foreground">Arrivals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.departures.length}</p>
                <p className="text-xs text-muted-foreground">Departures</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.currentGuestsCount}</p>
                <p className="text-xs text-muted-foreground">Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bed className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalGuestsCount}</p>
                <p className="text-xs text-muted-foreground">Guests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Arrivals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-green-600" />
            Arriving Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.arrivals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No arrivals expected today</p>
          ) : (
            <div className="space-y-3">
              {stats.arrivals.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{booking.users?.full_name || "Guest"}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.guests_count} guest(s) •{" "}
                      {booking.booking_rooms?.map((br: any) => br.rooms?.name).join(", ")}
                    </p>
                  </div>
                  <Badge variant={booking.status === "checked_in" ? "default" : "secondary"}>
                    {booking.status === "checked_in" ? "Checked In" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Departures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="w-5 h-5 text-orange-600" />
            Departing Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.departures.length === 0 ? (
            <p className="text-muted-foreground text-sm">No departures today</p>
          ) : (
            <div className="space-y-3">
              {stats.departures.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{booking.users?.full_name || "Guest"}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.guests_count} guest(s) •{" "}
                      {booking.booking_rooms?.map((br: any) => br.rooms?.name).join(", ")}
                    </p>
                  </div>
                  <Badge variant={booking.status === "checked_out" ? "outline" : "default"}>
                    {booking.status === "checked_out" ? "Checked Out" : "In House"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Coffee className="w-5 h-5" />
            Daily Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• Breakfast is served from 7:00 AM to 10:00 AM</li>
            <li>• Check-in time is 2:00 PM - 8:00 PM</li>
            <li>• Check-out time is 11:00 AM</li>
            <li>• Remember to verify guest IDs during check-in</li>
            <li>• Report any maintenance issues to staff</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
