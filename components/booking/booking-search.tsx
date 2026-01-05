"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Users, ArrowRight } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import type { BookingData } from "./booking-flow"

interface BookingSearchProps {
  initialData: BookingData
  onComplete: (data: Pick<BookingData, "checkIn" | "checkOut" | "guests">) => void
}

export function BookingSearch({ initialData, onComplete }: BookingSearchProps) {
  const [checkIn, setCheckIn] = useState<Date | undefined>(initialData.checkIn)
  const [checkOut, setCheckOut] = useState<Date | undefined>(initialData.checkOut)
  const [guests, setGuests] = useState(initialData.guests.toString())

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0
  const isValid = checkIn && checkOut && nights > 0

  const handleSubmit = () => {
    if (checkIn && checkOut) {
      onComplete({
        checkIn,
        checkOut,
        guests: Number.parseInt(guests),
      })
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Select Your Dates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Check In</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal h-12", !checkIn && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {checkIn ? format(checkIn, "EEE, MMM dd, yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={(date) => {
                    setCheckIn(date)
                    if (date && checkOut && date >= checkOut) {
                      setCheckOut(undefined)
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Check Out</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12",
                    !checkOut && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {checkOut ? format(checkOut, "EEE, MMM dd, yyyy") : "Select date"}
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
        </div>

        {/* Guests Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Number of Guests</label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="h-12">
              <Users className="mr-2 h-4 w-4 text-primary" />
              <SelectValue placeholder="Select guests" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "Guest" : "Guests"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary */}
        {isValid && (
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Stay Duration</span>
              <span className="font-semibold text-foreground">
                {nights} {nights === 1 ? "night" : "nights"}
              </span>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button onClick={handleSubmit} disabled={!isValid} size="lg" className="w-full">
          Search Availability
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
