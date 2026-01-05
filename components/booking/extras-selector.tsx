"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowRight, ArrowLeft, Plus, Minus, Loader2 } from "lucide-react"
import type { ExtraSelection } from "./booking-flow"
import { getServices } from "@/lib/actions/services"
import type { Service } from "@/types/database"

interface ExtrasSelectorProps {
  checkIn: Date
  checkOut: Date
  selectedExtras: ExtraSelection[]
  onComplete: (extras: ExtraSelection[]) => void
  onBack: () => void
}

export function ExtrasSelector({ checkIn, checkOut, selectedExtras, onComplete, onBack }: ExtrasSelectorProps) {
  const [selections, setSelections] = useState<ExtraSelection[]>(selectedExtras)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices()
        setServices(data)
      } catch (error) {
        console.error("Error loading services:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const updateSelection = (serviceId: string, quantity: number) => {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return

    setSelections((prev) => {
      if (quantity === 0) {
        return prev.filter((s) => s.serviceId !== serviceId)
      }
      const existing = prev.find((s) => s.serviceId === serviceId)
      if (existing) {
        return prev.map((s) => (s.serviceId === serviceId ? { ...s, quantity } : s))
      }
      return [
        ...prev,
        {
          serviceId: service.id,
          serviceName: service.name,
          quantity,
          price: service.price,
        },
      ]
    })
  }

  const getQuantity = (serviceId: string) => {
    return selections.find((s) => s.serviceId === serviceId)?.quantity || 0
  }

  const totalExtras = selections.reduce((sum, s) => sum + s.quantity * s.price, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground">Add Experiences</h2>
        <p className="text-muted-foreground text-sm">Enhance your stay with surf lessons and tours (optional)</p>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const quantity = getQuantity(service.id)
          const isSelected = quantity > 0

          return (
            <Card
              key={service.id}
              className={`overflow-hidden transition-all border-2 ${
                isSelected ? "border-primary shadow-lg" : "border-transparent shadow"
              }`}
            >
              <div className="relative h-36">
                <Image
                  src={service.image_url || "/placeholder.svg?height=200&width=400"}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
                {service.category === "surf" && (
                  <Badge className="absolute top-3 left-3 bg-coral text-white">Popular</Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{service.name}</h3>
                  <span className="text-lg font-bold text-primary">${service.price}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service.duration || "Varies"}
                  </span>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Quantity</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() => updateSelection(service.id, Math.max(0, quantity - 1))}
                      disabled={quantity === 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-6 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() => updateSelection(service.id, quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Extras Total */}
      {totalExtras > 0 && (
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Extras Total</span>
            <span className="font-semibold text-foreground">${totalExtras}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
        <Button onClick={() => onComplete(selections)}>
          {selections.length > 0 ? "Continue with Extras" : "Skip Extras"}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
