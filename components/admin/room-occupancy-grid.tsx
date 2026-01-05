"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bed, Users } from "lucide-react"

// Mock room data
const rooms = [
  { id: "dorm", name: "Dormitorio Compartido", totalBeds: 10, occupiedBeds: 7, type: "dorm" },
  { id: "private", name: "Cuarto Privado", totalBeds: 4, occupiedBeds: 4, type: "private" },
  { id: "family", name: "Cuarto Familiar", totalBeds: 4, occupiedBeds: 2, type: "family" },
  { id: "female", name: "Cuarto Femenino", totalBeds: 4, occupiedBeds: 3, type: "female" },
]

export function RoomOccupancyGrid() {
  const totalBeds = rooms.reduce((sum, r) => sum + r.totalBeds, 0)
  const totalOccupied = rooms.reduce((sum, r) => sum + r.occupiedBeds, 0)
  const overallOccupancy = Math.round((totalOccupied / totalBeds) * 100)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-lg">Room Occupancy</CardTitle>
          <Badge variant={overallOccupancy > 80 ? "default" : "secondary"} className="text-sm">
            {overallOccupancy}% Total
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {totalOccupied} of {totalBeds} beds occupied tonight
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {rooms.map((room) => {
          const occupancy = Math.round((room.occupiedBeds / room.totalBeds) * 100)
          const availableBeds = room.totalBeds - room.occupiedBeds

          return (
            <div key={room.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      occupancy === 100 ? "bg-coral/20" : occupancy > 70 ? "bg-amber-100" : "bg-seafoam/20"
                    }`}
                  >
                    <Bed
                      className={`w-4 h-4 ${
                        occupancy === 100 ? "text-coral" : occupancy > 70 ? "text-amber-600" : "text-seafoam"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{room.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {availableBeds > 0 ? `${availableBeds} beds available` : "Full"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{occupancy}%</p>
                  <p className="text-xs text-muted-foreground">
                    {room.occupiedBeds}/{room.totalBeds}
                  </p>
                </div>
              </div>
              <Progress
                value={occupancy}
                className={`h-2 ${
                  occupancy === 100
                    ? "[&>div]:bg-coral"
                    : occupancy > 70
                      ? "[&>div]:bg-amber-500"
                      : "[&>div]:bg-seafoam"
                }`}
              />
            </div>
          )
        })}

        {/* Visual Bed Grid */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-3">Bed Status Overview</p>
          <div className="grid grid-cols-9 gap-1">
            {Array.from({ length: totalBeds }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                  i < totalOccupied ? "bg-primary/80 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                <Users className="w-3 h-3" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary/80" /> Occupied
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-muted" /> Available
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
