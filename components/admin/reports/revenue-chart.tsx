"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

// Mock data - in production this would come from a server action
const revenueData = [
  { month: "Jan", accommodation: 4500, services: 1200, total: 5700 },
  { month: "Feb", accommodation: 5200, services: 1800, total: 7000 },
  { month: "Mar", accommodation: 6800, services: 2400, total: 9200 },
  { month: "Apr", accommodation: 7200, services: 2800, total: 10000 },
  { month: "May", accommodation: 5800, services: 2100, total: 7900 },
  { month: "Jun", accommodation: 4900, services: 1600, total: 6500 },
  { month: "Jul", accommodation: 5400, services: 1900, total: 7300 },
  { month: "Aug", accommodation: 5100, services: 1700, total: 6800 },
  { month: "Sep", accommodation: 3200, services: 900, total: 4100 },
  { month: "Oct", accommodation: 2800, services: 700, total: 3500 },
  { month: "Nov", accommodation: 4200, services: 1300, total: 5500 },
  { month: "Dec", accommodation: 7500, services: 3200, total: 10700 },
]

export function RevenueChart() {
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.total, 0)
  const avgMonthly = Math.round(totalRevenue / 12)

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
          <CardDescription>Monthly breakdown of accommodation vs services revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAccommodation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B8A9A" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#5B8A9A" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorServices" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E07A5F" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#E07A5F" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium mb-2">{label}</p>
                          {payload.map((entry, index) => (
                            <p key={index} className="text-sm" style={{ color: entry.color }}>
                              {entry.name}: ${entry.value?.toLocaleString()}
                            </p>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="accommodation"
                  name="Accommodation"
                  stroke="#5B8A9A"
                  fillOpacity={1}
                  fill="url(#colorAccommodation)"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="services"
                  name="Services"
                  stroke="#E07A5F"
                  fillOpacity={1}
                  fill="url(#colorServices)"
                  stackId="1"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Year Summary</CardTitle>
          <CardDescription>Total revenue breakdown</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Annual Revenue</p>
            <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Monthly</p>
            <p className="text-2xl font-bold">${avgMonthly.toLocaleString()}</p>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Accommodation</span>
                <span className="font-medium">
                  ${revenueData.reduce((sum, d) => sum + d.accommodation, 0).toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "70%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Services</span>
                <span className="font-medium">
                  ${revenueData.reduce((sum, d) => sum + d.services, 0).toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-coral rounded-full" style={{ width: "30%" }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
