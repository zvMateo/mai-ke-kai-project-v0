import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowRight, Calendar, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { format, addDays } from "date-fns"

// Mock recent bookings
const recentBookings = [
  {
    id: "MKK-ABC123",
    guestName: "Sarah Mitchell",
    email: "sarah@example.com",
    checkIn: new Date(),
    checkOut: addDays(new Date(), 3),
    roomType: "Private Room",
    status: "confirmed",
    amount: 255,
  },
  {
    id: "MKK-DEF456",
    guestName: "Thomas Klein",
    email: "thomas@example.com",
    checkIn: addDays(new Date(), 1),
    checkOut: addDays(new Date(), 5),
    roomType: "Dorm Bed",
    status: "pending_payment",
    amount: 100,
  },
  {
    id: "MKK-GHI789",
    guestName: "Maria Lopez",
    email: "maria@example.com",
    checkIn: addDays(new Date(), 2),
    checkOut: addDays(new Date(), 9),
    roomType: "Family Room",
    status: "confirmed",
    amount: 840,
  },
  {
    id: "MKK-JKL012",
    guestName: "James Wilson",
    email: "james@example.com",
    checkIn: new Date(),
    checkOut: addDays(new Date(), 2),
    roomType: "Female Dorm",
    status: "checked_in",
    amount: 60,
  },
]

const statusColors = {
  confirmed: "bg-green-100 text-green-800",
  pending_payment: "bg-amber-100 text-amber-800",
  checked_in: "bg-primary/20 text-primary",
  checked_out: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusLabels = {
  confirmed: "Confirmed",
  pending_payment: "Pending",
  checked_in: "In-House",
  checked_out: "Completed",
  cancelled: "Cancelled",
}

export function RecentBookings() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-heading text-lg">Recent Bookings</CardTitle>
          <p className="text-sm text-muted-foreground">Latest reservations</p>
        </div>
        <Link href="/admin/bookings">
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {booking.guestName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{booking.guestName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {format(booking.checkIn, "MMM d")} - {format(booking.checkOut, "MMM d")}
                    </span>
                    <span className="text-border">|</span>
                    <span>{booking.roomType}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="font-semibold">${booking.amount}</p>
                  <p className="text-xs text-muted-foreground">{booking.id}</p>
                </div>
                <Badge variant="secondary" className={statusColors[booking.status as keyof typeof statusColors]}>
                  {statusLabels[booking.status as keyof typeof statusLabels]}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
