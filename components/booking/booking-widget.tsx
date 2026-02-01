"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Users, Search } from "lucide-react"
import { format, addDays } from "date-fns"
import { cn } from "@/lib/utils"

export function BookingWidget() {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState<Date | undefined>(addDays(new Date(), 7))
  const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(new Date(), 10))
  const [guests, setGuests] = useState("2")

  const handleSearch = () => {
    if (checkIn && checkOut) {
      const params = new URLSearchParams({
        mode: "accommodation",
        checkIn: format(checkIn, "yyyy-MM-dd"),
        checkOut: format(checkOut, "yyyy-MM-dd"),
        guests: guests,
      })
      router.push(`/booking?${params.toString()}`)
    }
  }

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
        {/* Check In */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-deep">Check In</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal h-12", !checkIn && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {checkIn ? format(checkIn, "MMM dd, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check Out */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-deep">Check Out</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal h-12", !checkOut && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {checkOut ? format(checkOut, "MMM dd, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={(date) => date <= (checkIn || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-deep">Guests</label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="h-12">
              <Users className="mr-2 h-4 w-4 text-primary" />
              <SelectValue placeholder="Guests" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "Guest" : "Guests"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button onClick={handleSearch} size="lg" className="h-12 sm:col-span-2 lg:col-span-1 bg-primary hover:bg-primary/90 text-white shadow-lg">
          <Search className="mr-2 h-5 w-5" />
          <span>Search</span>
        </Button>
      </div>
    </div>
  )
}
