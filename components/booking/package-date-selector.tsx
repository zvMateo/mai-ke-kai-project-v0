"use client"

import {useState} from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Users, Moon, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { format, addDays } from "date-fns"
import { cn } from "@/lib/utils"


interface PackageDateSelectorProps {
  packageData: {
    name: string
    nights: number
    is_for_two?: boolean
    includes?: string[]
    price?: number
    image_url?: string
  }
  onComplete: (data: { checkIn: Date; checkOut: Date; guests: number }) => void
  onBack: () => void
}
export function PackageDateSelector({
  packageData,
  onComplete,
  onBack,
}: PackageDateSelectorProps) {
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined)
  const [guests, setGuests] = useState(packageData.is_for_two ? "2" : "1")
  const checkOut = checkIn ? addDays(checkIn, packageData.nights) : undefined
  const handleContinue = () => {
    if (checkIn && checkOut) {
      onComplete({
        checkIn,
        checkOut,
        guests: Number.parseInt(guests),
      })
    }
  }
  return (
    <div className="space-y-6">
      {/* Package Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
            {packageData.name}
          </h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Moon className="w-4 h-4" />
              {packageData.nights} {packageData.nights === 1 ? "night" : "nights"}
            </span>
            {packageData.price && (
              <span className="text-lg font-bold text-primary">
                From ${packageData.price}
              </span>
            )}
          </div>
          {packageData.includes && packageData.includes.length > 0 && (
            <div className="space-y-1.5">
              {packageData.includes.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
              {packageData.includes.length > 4 && (
                <p className="text-sm text-primary ml-5">
                  +{packageData.includes.length - 4} more included
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Date Selection */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground mb-1">
              Select Your Start Date
            </h3>
            <p className="text-sm text-muted-foreground">
              Your stay will be {packageData.nights} nights — check-out is calculated automatically.
            </p>
          </div>
          {/* Check In */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Check In</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12",
                    !checkIn && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {checkIn ? format(checkIn, "EEE, MMM dd, yyyy") : "Select your arrival date"}
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
          {/* Check Out (auto-calculated, read only) */}
          {checkIn && checkOut && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Check Out</label>
              <div className="flex items-center h-12 px-4 rounded-md border border-input bg-muted/50">
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                <span className="text-foreground">
                  {format(checkOut, "EEE, MMM dd, yyyy")}
                </span>
                <span className="ml-auto text-sm text-muted-foreground">
                  {packageData.nights} nights
                </span>
              </div>
            </div>
          )}
          {/* Guests */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {packageData.is_for_two ? "Guests (this package is for 2)" : "Number of Guests"}
            </label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger className="h-12">
                <Users className="mr-2 h-4 w-4 text-primary" />
                <SelectValue placeholder="Guests" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "Guest" : "Guests"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!checkIn} size="lg">
          Continue
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
