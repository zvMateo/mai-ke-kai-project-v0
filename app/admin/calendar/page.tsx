"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  isWithinInterval,
} from "date-fns"

// Mock booking data for calendar
const mockBookings = [
  {
    id: "MKK-1",
    guestName: "Sarah M.",
    roomId: "private",
    checkIn: new Date(),
    checkOut: addDays(new Date(), 3),
    color: "bg-primary",
  },
  {
    id: "MKK-2",
    guestName: "Thomas K.",
    roomId: "dorm",
    checkIn: addDays(new Date(), 2),
    checkOut: addDays(new Date(), 6),
    color: "bg-seafoam",
  },
  {
    id: "MKK-3",
    guestName: "Maria L.",
    roomId: "family",
    checkIn: addDays(new Date(), 5),
    checkOut: addDays(new Date(), 12),
    color: "bg-coral",
  },
  {
    id: "MKK-4",
    guestName: "James W.",
    roomId: "female",
    checkIn: addDays(new Date(), -2),
    checkOut: addDays(new Date(), 1),
    color: "bg-amber-500",
  },
]

const rooms = [
  { id: "all", name: "All Rooms" },
  { id: "dorm", name: "Dormitorio Compartido" },
  { id: "private", name: "Cuarto Privado" },
  { id: "family", name: "Cuarto Familiar" },
  { id: "female", name: "Cuarto Femenino" },
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedRoom, setSelectedRoom] = useState("all")
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startDayOfWeek = monthStart.getDay()
  const emptyDays = Array.from({ length: startDayOfWeek }, (_, i) => i)

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  const getBookingsForDay = (day: Date) => {
    return mockBookings.filter((booking) => {
      const isInRange = isWithinInterval(day, { start: booking.checkIn, end: addDays(booking.checkOut, -1) })
      const roomMatch = selectedRoom === "all" || booking.roomId === selectedRoom
      return isInRange && roomMatch
    })
  }

  const filteredBookings = selectedRoom === "all" ? mockBookings : mockBookings.filter((b) => b.roomId === selectedRoom)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View and manage room availability</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Block Dates
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-xl">{format(currentDate, "MMMM yyyy")}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {/* Header */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="bg-muted p-3 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}

            {/* Empty cells */}
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="bg-card p-2 min-h-[120px]" />
            ))}

            {/* Days */}
            {daysInMonth.map((day) => {
              const isToday = isSameDay(day, new Date())
              const dayBookings = getBookingsForDay(day)
              const hasBookings = dayBookings.length > 0

              return (
                <Dialog key={day.toISOString()}>
                  <DialogTrigger asChild>
                    <div
                      className={`bg-card p-2 min-h-[120px] hover:bg-muted/50 cursor-pointer transition-colors ${
                        isToday ? "ring-2 ring-primary ring-inset" : ""
                      }`}
                      onClick={() => setSelectedDay(day)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-medium ${
                            isToday
                              ? "bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center"
                              : !isSameMonth(day, currentDate)
                                ? "text-muted-foreground"
                                : ""
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                        {hasBookings && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {dayBookings.length}
                          </Badge>
                        )}
                      </div>

                      {/* Booking Bars */}
                      <div className="space-y-1">
                        {dayBookings.slice(0, 3).map((booking) => (
                          <div
                            key={booking.id}
                            className={`${booking.color} text-white text-[10px] px-1.5 py-0.5 rounded truncate`}
                          >
                            {booking.guestName}
                          </div>
                        ))}
                        {dayBookings.length > 3 && (
                          <div className="text-[10px] text-muted-foreground text-center">
                            +{dayBookings.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-heading">{format(day, "EEEE, MMMM d, yyyy")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                      {dayBookings.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No bookings for this day</p>
                      ) : (
                        dayBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${booking.color}`} />
                              <div>
                                <p className="font-medium">{booking.guestName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(booking.checkIn, "MMM d")} - {format(booking.checkOut, "MMM d")}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">{rooms.find((r) => r.id === booking.roomId)?.name}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Private</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-seafoam" />
              <span className="text-sm text-muted-foreground">Dorm</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-coral" />
              <span className="text-sm text-muted-foreground">Family</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-muted-foreground">Female</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-sm text-muted-foreground">Blocked</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredBookings
              .filter((b) => b.checkIn >= new Date())
              .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime())
              .slice(0, 5)
              .map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${booking.color}`} />
                    <div>
                      <p className="font-medium">{booking.guestName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(booking.checkIn, "EEE, MMM d")} - {format(booking.checkOut, "EEE, MMM d")}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{rooms.find((r) => r.id === booking.roomId)?.name}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
