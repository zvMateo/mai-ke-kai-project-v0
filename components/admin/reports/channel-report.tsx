"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Progress } from "@/components/ui/progress"

const channelData = [
  { name: "Booking.com", bookings: 45, revenue: 12500, commission: 1875, color: "#003580" },
  { name: "Direct", bookings: 28, revenue: 8200, commission: 0, color: "#7DCFB6" },
  { name: "Hostelworld", bookings: 18, revenue: 4800, commission: 720, color: "#FF6B00" },
  { name: "Airbnb", bookings: 12, revenue: 3600, commission: 540, color: "#FF5A5F" },
  { name: "Instagram", bookings: 8, revenue: 2400, commission: 0, color: "#E4405F" },
  { name: "Booksurfcamps", bookings: 5, revenue: 1500, commission: 225, color: "#0EA5E9" },
]

export function ChannelReport() {
  const totalBookings = channelData.reduce((sum, c) => sum + c.bookings, 0)
  const totalRevenue = channelData.reduce((sum, c) => sum + c.revenue, 0)
  const totalCommission = channelData.reduce((sum, c) => sum + c.commission, 0)
  const directRevenue = channelData.filter((c) => c.commission === 0).reduce((sum, c) => sum + c.revenue, 0)
  const directPercentage = Math.round((directRevenue / totalRevenue) * 100)

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Bookings by Channel</CardTitle>
          <CardDescription>Distribution of reservations across platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} layout="vertical" margin={{ top: 0, right: 0, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm">Bookings: {data.bookings}</p>
                          <p className="text-sm">Revenue: ${data.revenue.toLocaleString()}</p>
                          {data.commission > 0 && (
                            <p className="text-sm text-red-600">Commission: -${data.commission.toLocaleString()}</p>
                          )}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="bookings" radius={[0, 4, 4, 0]}>
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
            <CardTitle className="text-base">Direct Booking Goal</CardTitle>
            <CardDescription>Target: Increase direct bookings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Direct Revenue</span>
                <span className="font-medium">{directPercentage}%</span>
              </div>
              <Progress value={directPercentage} className="h-3" />
            </div>
            <p className="text-sm text-muted-foreground">
              ${directRevenue.toLocaleString()} of ${totalRevenue.toLocaleString()} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Commission Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Commissions Paid</p>
              <p className="text-2xl font-bold text-red-600">-${totalCommission.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Effective Commission Rate</p>
              <p className="text-xl font-bold">{Math.round((totalCommission / totalRevenue) * 100)}%</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">Net Revenue</p>
              <p className="text-xl font-bold text-seafoam">${(totalRevenue - totalCommission).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
