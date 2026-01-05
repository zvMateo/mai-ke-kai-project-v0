"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil, Sun, Cloud, CloudRain } from "lucide-react"
import { upsertRoomPricing } from "@/lib/actions/pricing"
import { useRouter } from "next/navigation"

interface PricingEditDialogProps {
  room: {
    id: string
    name: string
    type: string
    sell_unit: string
  }
  pricing: {
    high?: any
    mid?: any
    low?: any
  }
}

export function PricingEditDialog({ room, pricing }: PricingEditDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"high" | "mid" | "low">("high")

  const [formData, setFormData] = useState({
    high: {
      base_price: pricing.high?.base_price || 0,
      rack_rate: pricing.high?.rack_rate || 0,
      competitive_rate: pricing.high?.competitive_rate || 0,
      last_minute_rate: pricing.high?.last_minute_rate || 0,
    },
    mid: {
      base_price: pricing.mid?.base_price || 0,
      rack_rate: pricing.mid?.rack_rate || 0,
      competitive_rate: pricing.mid?.competitive_rate || 0,
      last_minute_rate: pricing.mid?.last_minute_rate || 0,
    },
    low: {
      base_price: pricing.low?.base_price || 0,
      rack_rate: pricing.low?.rack_rate || 0,
      competitive_rate: pricing.low?.competitive_rate || 0,
      last_minute_rate: pricing.low?.last_minute_rate || 0,
    },
  })

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save all three seasons
      await Promise.all([
        upsertRoomPricing(room.id, "high", formData.high),
        upsertRoomPricing(room.id, "mid", formData.mid),
        upsertRoomPricing(room.id, "low", formData.low),
      ])
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to save pricing:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateSeasonPrice = (season: "high" | "mid" | "low", field: string, value: number) => {
    setFormData({
      ...formData,
      [season]: {
        ...formData[season],
        [field]: value,
      },
    })
  }

  const autoCalculateRates = (season: "high" | "mid" | "low", basePrice: number) => {
    setFormData({
      ...formData,
      [season]: {
        base_price: basePrice,
        rack_rate: basePrice,
        competitive_rate: Math.round(basePrice * 0.9 * 100) / 100, // 10% discount
        last_minute_rate: Math.round(basePrice * 0.8 * 100) / 100, // 20% discount
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-transparent">
          <Pencil className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Pricing: {room.name}</DialogTitle>
          <DialogDescription>Set prices per {room.sell_unit} per night for each season</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="high" className="flex items-center gap-1">
              <Sun className="w-4 h-4" />
              High
            </TabsTrigger>
            <TabsTrigger value="mid" className="flex items-center gap-1">
              <Cloud className="w-4 h-4" />
              Mid
            </TabsTrigger>
            <TabsTrigger value="low" className="flex items-center gap-1">
              <CloudRain className="w-4 h-4" />
              Low
            </TabsTrigger>
          </TabsList>

          {(["high", "mid", "low"] as const).map((season) => (
            <TabsContent key={season} value={season} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${season}-base`}>Base Price (USD)</Label>
                <div className="flex gap-2">
                  <Input
                    id={`${season}-base`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData[season].base_price}
                    onChange={(e) => updateSeasonPrice(season, "base_price", Number.parseFloat(e.target.value) || 0)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => autoCalculateRates(season, formData[season].base_price)}
                  >
                    Auto-fill
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Click Auto-fill to calculate other rates automatically</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${season}-rack`}>Rack Rate</Label>
                  <Input
                    id={`${season}-rack`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData[season].rack_rate}
                    onChange={(e) => updateSeasonPrice(season, "rack_rate", Number.parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">60+ days</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${season}-competitive`}>Competitive</Label>
                  <Input
                    id={`${season}-competitive`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData[season].competitive_rate}
                    onChange={(e) =>
                      updateSeasonPrice(season, "competitive_rate", Number.parseFloat(e.target.value) || 0)
                    }
                  />
                  <p className="text-xs text-muted-foreground">10-59 days</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${season}-lastminute`}>Last Minute</Label>
                  <Input
                    id={`${season}-lastminute`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData[season].last_minute_rate}
                    onChange={(e) =>
                      updateSeasonPrice(season, "last_minute_rate", Number.parseFloat(e.target.value) || 0)
                    }
                  />
                  <p className="text-xs text-muted-foreground">&lt;10 days</p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Pricing"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
