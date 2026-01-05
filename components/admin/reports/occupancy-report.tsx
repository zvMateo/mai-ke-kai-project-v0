"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

// Mock data
const occupancyData = [
  { month: "Jan", rate: 85, target: 70 },
  { month: "Feb", rate: 92, target: 70 },
  { month: "Mar", rate: 95, target: 70 },
  { month: "Apr", rate: 88, target: 70 },
  { month: "May", rate: 72, target: 70 },
  { month: "Jun", rate: 65, target: 70 },
  { month: "Jul", rate: 70, target: 70 },
  { month: "Aug", rate: 68, target: 70 },
  { month: "Sep", rate: 45, target: 70 },
  { month: "Oct", rate: 40, target: 70 },
  { month: "Nov", rate: 58, target: 70 },
  { month: "Dec", rate: 98, target: 70 },
]

const roomOccupancy = [
  { room: "Dorm Mixto (10)", occupancy: 78, nights: 234 },
  { room: "Privada (4)", occupancy: 82, nights: 98 },
  { room: "Familiar (4)", occupancy: 65, nights: 78 },
  { room: "Femenino (4)", occupancy: 71, nights: 85 },
]

export function OccupancyReport() {
  const avgOccupancy = Math.round(occupancyData.reduce((sum, d) => sum + d.rate, 0) / 12)
  const aboveTarget = occupancyData.filter((d) => d.rate >= d.target).length

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Occupancy Rate</CardTitle>
          <CardDescription>Target: 70% occupancy throughout the year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const rate = payload[0].value as number
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">
                            Occupancy: <span className="font-medium">{rate}%</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rate >= 70 ? "Above target" : "Below target"}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.rate >= 70 ? "#7DCFB6" : "#E07A5F"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Year Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Average Occupancy</p>
              <p className="text-3xl font-bold">{avgOccupancy}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Months Above Target</p>
              <p className="text-2xl font-bold text-seafoam">{aboveTarget} / 12</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Room Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {roomOccupancy.map((room) => (
              <div key={room.room}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="truncate pr-2">{room.room}</span>
                  <span className="font-medium">{room.occupancy}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${room.occupancy}%`,
                      backgroundColor: room.occupancy >= 70 ? "#7DCFB6" : "#E07A5F",
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
