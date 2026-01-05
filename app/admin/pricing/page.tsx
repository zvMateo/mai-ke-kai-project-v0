import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Calendar, Sun, Cloud, CloudRain } from "lucide-react"
import { PricingEditDialog } from "@/components/admin/pricing-edit-dialog"

async function getPricingData() {
  const supabase = await createClient()

  // Get all rooms with their pricing
  const { data: rooms } = await supabase
    .from("rooms")
    .select(
      `
      id,
      name,
      type,
      sell_unit,
      season_pricing (*)
    `,
    )
    .eq("is_active", true)
    .order("name")

  // Get season dates
  const { data: seasonDates } = await supabase.from("season_dates").select("*").order("start_date")

  return {
    rooms: rooms || [],
    seasonDates: seasonDates || [],
  }
}

const seasonIcons = {
  high: Sun,
  mid: Cloud,
  low: CloudRain,
}

const seasonColors = {
  high: "bg-orange-100 text-orange-800",
  mid: "bg-blue-100 text-blue-800",
  low: "bg-green-100 text-green-800",
}

const seasonLabels = {
  high: "High Season",
  mid: "Mid Season",
  low: "Low Season",
}

export default async function PricingPage() {
  const { rooms, seasonDates } = await getPricingData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Pricing Management</h1>
          <p className="text-muted-foreground">Configure room prices by season</p>
        </div>
      </div>

      {/* Season Dates Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Season Dates
          </CardTitle>
          <CardDescription>Configure when each season starts and ends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["high", "mid", "low"] as const).map((season) => {
              const Icon = seasonIcons[season]
              const dates = seasonDates.find((d) => d.season === season)

              return (
                <div key={season} className={`p-4 rounded-lg ${seasonColors[season]}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{seasonLabels[season]}</span>
                  </div>
                  <p className="text-sm">{dates ? `${dates.start_date} to ${dates.end_date}` : "Not configured"}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Room Pricing
          </CardTitle>
          <CardDescription>Prices per night by room and season (in USD)</CardDescription>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No rooms configured. Add rooms first to set pricing.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Sun className="w-4 h-4 text-orange-500" />
                      High
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Cloud className="w-4 h-4 text-blue-500" />
                      Mid
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <CloudRain className="w-4 h-4 text-green-500" />
                      Low
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => {
                  const pricing = Array.isArray(room.season_pricing) ? room.season_pricing : []
                  const highPrice = pricing.find((p: any) => p.season === "high")
                  const midPrice = pricing.find((p: any) => p.season === "mid")
                  const lowPrice = pricing.find((p: any) => p.season === "low")

                  return (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {room.sell_unit}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {highPrice ? (
                          <div>
                            <p className="font-bold">${highPrice.base_price}</p>
                            <p className="text-xs text-muted-foreground">Rack: ${highPrice.rack_rate}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {midPrice ? (
                          <div>
                            <p className="font-bold">${midPrice.base_price}</p>
                            <p className="text-xs text-muted-foreground">Rack: ${midPrice.rack_rate}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {lowPrice ? (
                          <div>
                            <p className="font-bold">${lowPrice.base_price}</p>
                            <p className="text-xs text-muted-foreground">Rack: ${lowPrice.rack_rate}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <PricingEditDialog
                          room={room}
                          pricing={{
                            high: highPrice,
                            mid: midPrice,
                            low: lowPrice,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pricing Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Strategy Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground">Rate Types:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Base Price:</strong> The standard rate shown to guests
              </li>
              <li>
                <strong>Rack Rate:</strong> Full price for bookings 60+ days in advance
              </li>
              <li>
                <strong>Competitive Rate:</strong> Discounted rate for 10-59 days in advance (typically 10% off)
              </li>
              <li>
                <strong>Last Minute:</strong> Deep discount for bookings within 10 days (typically 20% off)
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-foreground">Season Dates (Costa Rica):</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>High Season:</strong> Dec 27 - Apr 30 (Dry season, peak tourism)
              </li>
              <li>
                <strong>Mid Season:</strong> May 1 - Aug 31, Nov 1 - Dec 26 (Shoulder season)
              </li>
              <li>
                <strong>Low Season:</strong> Sep 1 - Oct 31 (Rainy season)
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
