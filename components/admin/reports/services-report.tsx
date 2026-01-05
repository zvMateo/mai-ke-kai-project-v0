"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const serviceCategories = [
  { name: "Surf Lessons", value: 8500, color: "#5B8A9A", count: 142 },
  { name: "Tours", value: 5200, color: "#E07A5F", count: 54 },
  { name: "Transport", value: 3800, color: "#7DCFB6", count: 76 },
  { name: "Other", value: 1200, color: "#0E3244", count: 23 },
]

const topServices = [
  { name: "Surf Lesson (Beginner)", category: "Surf", sold: 98, revenue: 5880, trend: "up" },
  { name: "Sunset Catamaran", category: "Tour", sold: 32, revenue: 3040, trend: "up" },
  { name: "Shuttle Liberia Airport", category: "Transport", sold: 45, revenue: 1800, trend: "stable" },
  { name: "Surf Lesson (Intermediate)", category: "Surf", sold: 44, revenue: 2640, trend: "up" },
  { name: "Snorkel Catalinas", category: "Tour", sold: 22, revenue: 1980, trend: "down" },
  { name: "Photo Package", category: "Surf", sold: 56, revenue: 1680, trend: "up" },
]

export function ServicesReport() {
  const totalRevenue = serviceCategories.reduce((sum, c) => sum + c.value, 0)
  const totalSold = serviceCategories.reduce((sum, c) => sum + c.count, 0)

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Category</CardTitle>
          <CardDescription>Service sales distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {serviceCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm">${data.value.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{data.count} sold</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Services Sold</p>
              <p className="text-xl font-bold">{totalSold}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top Performing Services</CardTitle>
          <CardDescription>Most popular services this period</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topServices.map((service) => (
                <TableRow key={service.name}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{service.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{service.sold}</TableCell>
                  <TableCell className="text-right">${service.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {service.trend === "up" && <span className="text-green-600">+</span>}
                    {service.trend === "down" && <span className="text-red-600">-</span>}
                    {service.trend === "stable" && <span className="text-muted-foreground">=</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
