"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, Bed, Check, ArrowUpCircle } from "lucide-react"
import { useRoomsWithPricing } from "@/lib/queries"
import { Loader2, AlertCircle } from "lucide-react"
import type { RoomSelection } from "./base/types"
interface PackageRoomUpgradeProps {
  checkIn: Date
  packageData: {
    room_type?: string
    nights: number
    name: string
  }
  guests: number
  selectedRooms: RoomSelection[]
  onComplete: (rooms: RoomSelection[]) => void
  onBack: () => void
}
export function PackageRoomUpgrade({
  checkIn,
  packageData,
  guests,
  selectedRooms,
  onComplete,
  onBack,
}: PackageRoomUpgradeProps) {
  const { data: rooms = [], isLoading, error, refetch } = useRoomsWithPricing(checkIn)
  // Find the default room (cheapest, matching package room_type or just cheapest)
  const defaultRoomType = packageData.room_type || "dorm"
  const sortedRooms = [...rooms].sort((a, b) => a.price_per_night - b.price_per_night)
  const defaultRoom = sortedRooms.find((r) => r.type === defaultRoomType) || sortedRooms[0]
  const defaultPrice = defaultRoom?.price_per_night || 0
  // Initialize selection with the default room if nothing selected yet
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    selectedRooms[0]?.roomId || defaultRoom?.id || null
  )
  const handleContinue = () => {
    const chosen = rooms.find((r) => r.id === selectedRoomId) || defaultRoom
    if (!chosen) return
    const selection: RoomSelection[] = []
    // One bed per guest
    for (let i = 0; i < guests; i++) {
      selection.push({
        roomId: chosen.id,
        roomName: chosen.name,
        quantity: 1,
        pricePerNight: chosen.price_per_night,
        sellUnit: "bed",
      })
    }
    // Merge into single entry with quantity = guests
    const merged: RoomSelection = {
      roomId: chosen.id,
      roomName: chosen.name,
      quantity: guests,
      pricePerNight: chosen.price_per_night,
      sellUnit: "bed",
    }
    onComplete([merged])
  }
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
  const upgradeOptions = sortedRooms.filter((r) => r.id !== defaultRoom?.id)
  const hasUpgrades = upgradeOptions.length > 0
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground">
          Your Accommodation
        </h2>
        <p className="text-muted-foreground text-sm">
          Your package includes a bed in the default room. You can upgrade if you&apos;d like.
        </p>
      </div>
      {/* Default Room (included in package) */}
      {defaultRoom && (
        <Card
          className={`overflow-hidden transition-all border-2 cursor-pointer ${
            selectedRoomId === defaultRoom.id
              ? "border-primary shadow-lg"
              : "border-transparent shadow"
          }`}
          onClick={() => setSelectedRoomId(defaultRoom.id)}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    Included in package
                  </Badge>
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mt-2">
                  {defaultRoom.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {defaultRoom.description || `Bed in ${defaultRoom.name}`}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Bed className="w-4 h-4" />
                  <span>{defaultRoom.capacity} beds available</span>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-lg font-bold text-green-600">$0 extra</p>
                <p className="text-xs text-muted-foreground">per bed/night</p>
              </div>
            </div>
            {selectedRoomId === defaultRoom.id && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-sm text-primary">
                <Check className="w-4 h-4" />
                <span>Selected — {guests} {guests === 1 ? "bed" : "beds"}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Upgrade Options */}
      {hasUpgrades && (
        <>
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-primary" />
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Upgrade Your Room
            </h3>
          </div>
          <div className="space-y-3">
            {upgradeOptions.map((room) => {
              const extraPerNight = room.price_per_night - defaultPrice
              const totalExtra = extraPerNight * guests * packageData.nights
              return (
                <Card
                  key={room.id}
                  className={`overflow-hidden transition-all border-2 cursor-pointer ${
                    selectedRoomId === room.id
                      ? "border-primary shadow-lg"
                      : "border-transparent shadow hover:shadow-md"
                  }`}
                  onClick={() => setSelectedRoomId(room.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-semibold text-foreground">
                          {room.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {room.description || `Bed in ${room.name}`}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Bed className="w-4 h-4" />
                          <span>{room.capacity} beds available</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-primary">
                          +${extraPerNight}/night
                        </p>
                        <p className="text-xs text-muted-foreground">
                          +${totalExtra} total for {guests} {guests === 1 ? "bed" : "beds"}
                        </p>
                      </div>
                    </div>
                    {selectedRoomId === room.id && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-sm text-primary">
                        <Check className="w-4 h-4" />
                        <span>Selected — {guests} {guests === 1 ? "bed" : "beds"}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
      {/* No upgrades message */}
      {!hasUpgrades && defaultRoom && (
        <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          Your accommodation is included in the package price. No additional room options are available at this time.
        </div>
      )}
      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!selectedRoomId} size="lg">
          Continue
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
