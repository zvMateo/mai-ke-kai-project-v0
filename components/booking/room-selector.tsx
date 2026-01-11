"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Bed, ArrowRight, ArrowLeft, Plus, Minus, Loader2, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import type { RoomSelection } from "./booking-flow"
import { useRoomsWithPricing } from "@/lib/queries"

interface RoomSelectorProps {
  checkIn: Date
  checkOut: Date
  guests: number
  selectedRooms: RoomSelection[]
  onComplete: (rooms: RoomSelection[]) => void
  onBack: () => void
}

export function RoomSelector({ checkIn, checkOut, guests, selectedRooms, onComplete, onBack }: RoomSelectorProps) {
  const [selections, setSelections] = useState<RoomSelection[]>(selectedRooms)

  // Use React Query for data fetching with automatic caching and retries
  const { data: rooms = [], isLoading, error, refetch } = useRoomsWithPricing(checkIn)

  const updateSelection = (roomId: string, quantity: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return

    setSelections((prev) => {
      const existing = prev.find((s) => s.roomId === roomId)
      if (quantity === 0) {
        return prev.filter((s) => s.roomId !== roomId)
      }
      if (existing) {
        return prev.map((s) => (s.roomId === roomId ? { ...s, quantity } : s))
      }

      const sellUnit = room.type === "dorm" || room.type === "female" ? "bed" : "room"

      return [
        ...prev,
        {
          roomId: room.id,
          roomName: room.name,
          quantity,
          pricePerNight: room.price_per_night,
          sellUnit,
        },
      ]
    })
  }

  const getQuantity = (roomId: string) => {
    return selections.find((s) => s.roomId === roomId)?.quantity || 0
  }

  const totalSelected = selections.reduce((sum, s) => sum + s.quantity, 0)
  const canContinue = totalSelected >= guests

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="text-muted-foreground">Failed to load rooms. Please try again.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Select Your Room</h2>
          <p className="text-muted-foreground text-sm">
            {format(checkIn, "MMM dd")} - {format(checkOut, "MMM dd")} • {guests} guests
          </p>
        </div>
        <Badge
          variant="outline"
          className={totalSelected >= guests ? "bg-green-50 text-green-700 border-green-200" : ""}
        >
          {totalSelected} / {guests} beds
        </Badge>
      </div>

      {/* Room Cards */}
      <div className="space-y-4">
        {rooms.map((room) => {
          const quantity = getQuantity(room.id)
          const isSelected = quantity > 0
          const sellUnit = room.type === "dorm" || room.type === "female" ? "bed" : "room"
          const availableCount = room.capacity
          const amenitiesList = room.amenities || ["Free WiFi", "Hot Shower"]

          return (
            <Card
              key={room.id}
              className={`overflow-hidden transition-all border-2 ${
                isSelected ? "border-primary shadow-lg" : "border-transparent shadow"
              }`}
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0">
                    <Image
                      src={room.image_url || "/placeholder.svg?height=200&width=200"}
                      alt={room.name}
                      fill
                      className="object-cover"
                    />
                    {availableCount <= 2 && (
                      <Badge className="absolute top-3 left-3 bg-coral text-white">Only {availableCount} left!</Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-heading text-lg font-semibold text-foreground">{room.name}</h3>
                          <div className="text-right">
                            <span className="text-xl font-bold text-primary">${room.price_per_night}</span>
                            <span className="text-muted-foreground text-sm">/{sellUnit}/night</span>
                          </div>
                        </div>

                        {room.description && <p className="text-sm text-muted-foreground mb-3">{room.description}</p>}

                        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            {availableCount} available
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {sellUnit === "bed" ? "Per bed" : `Up to ${room.capacity}`}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {amenitiesList.map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-sm font-medium text-foreground">
                          {sellUnit === "bed" ? "Beds" : "Rooms"}
                        </span>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateSelection(room.id, Math.max(0, quantity - 1))}
                            disabled={quantity === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateSelection(room.id, Math.min(availableCount, quantity + 1))}
                            disabled={quantity >= availableCount}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
        <Button onClick={() => onComplete(selections)} disabled={!canContinue}>
          Continue
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
