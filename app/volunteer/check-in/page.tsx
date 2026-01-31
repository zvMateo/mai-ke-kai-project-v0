import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, User, Calendar, Bed } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

async function getPendingCheckIns() {
  const supabase = await createClient()
  const today = format(new Date(), "yyyy-MM-dd")

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
      booking_rooms (rooms (name, type)),
      check_in_data (completed_at, terms_accepted)
    `,
    )
    .eq("status", "confirmed")
    .lte("check_in", today)
    .order("check_in", { ascending: true })

  return bookings || []
}

export default async function VolunteerCheckInPage() {
  const pendingCheckIns = await getPendingCheckIns()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Check-in Guests</h2>
        <p className="text-muted-foreground">Process guest arrivals and verify their information</p>
      </div>

      {pendingCheckIns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No pending check-ins</p>
            <p className="text-muted-foreground">All guests have been checked in</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingCheckIns.map((booking: any) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{booking.users?.full_name || "Guest"}</p>
                        <p className="text-sm text-muted-foreground">{booking.users?.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(booking.check_in), "MMM d")} -{" "}
                          {format(new Date(booking.check_out), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Bed className="w-4 h-4" />
                        <span>{booking.booking_rooms?.map((br: any) => br.rooms?.name).join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{booking.guests_count} guest(s)</span>
                      </div>
                    </div>

                    {booking.special_requests && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm font-medium text-amber-800">Special Requests:</p>
                        <p className="text-sm text-amber-700">{booking.special_requests}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {booking.check_in_data?.[0]?.completed_at ? (
                        <Badge variant="default" className="bg-green-600">
                          Online Check-in Complete
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Online Check-in Pending</Badge>
                      )}
                      {booking.users?.nationality && <Badge variant="outline">{booking.users.nationality}</Badge>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link href="https://docs.google.com/forms/d/e/1FAIpQLSdL5eZD8ZYn6KStj0BvZThe4j_h5EkWGUMYL-lSP1TsOA6-IQ/viewform" target="_blank">
                      <Button className="w-full">
                        <ClipboardCheck className="w-4 h-4 mr-2" />
                        Process Check-in
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
