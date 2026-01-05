"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarDays, User, Bed, DollarSign, Loader2, AlertCircle, Plus, Minus } from "lucide-react"
import { createManualBooking } from "@/lib/actions/admin-bookings"

interface ManualBookingFormProps {
  rooms: any[]
  services: any[]
}

export function ManualBookingForm({ rooms, services }: ManualBookingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    // Guest info
    guestEmail: "",
    guestName: "",
    guestPhone: "",
    guestNationality: "",
    // Booking info
    checkIn: "",
    checkOut: "",
    guestsCount: 1,
    source: "walk_in" as "walk_in" | "phone" | "ota",
    specialRequests: "",
    // Payment
    paymentStatus: "pending" as "pending" | "partial" | "paid",
    paidAmount: 0,
  })

  // Room selections
  const [selectedRooms, setSelectedRooms] = useState<
    {
      roomId: string
      bedId?: string
      quantity: number
      pricePerNight: number
    }[]
  >([])

  // Service selections
  const [selectedServices, setSelectedServices] = useState<
    {
      serviceId: string
      quantity: number
      price: number
    }[]
  >([])

  const addRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return

    // Get default price (you'd want to calculate based on season)
    const defaultPrice = room.type === "dorm" ? 25 : room.type === "private" ? 80 : 60

    setSelectedRooms([
      ...selectedRooms,
      {
        roomId,
        quantity: 1,
        pricePerNight: defaultPrice,
      },
    ])
  }

  const removeRoom = (index: number) => {
    setSelectedRooms(selectedRooms.filter((_, i) => i !== index))
  }

  const updateRoomPrice = (index: number, price: number) => {
    const updated = [...selectedRooms]
    updated[index].pricePerNight = price
    setSelectedRooms(updated)
  }

  const addService = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return

    setSelectedServices([
      ...selectedServices,
      {
        serviceId,
        quantity: 1,
        price: service.price,
      },
    ])
  }

  const removeService = (index: number) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index))
  }

  // Calculate totals
  const nights =
    formData.checkIn && formData.checkOut
      ? Math.ceil(
          (new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0

  const roomsTotal = selectedRooms.reduce((sum, r) => sum + r.pricePerNight * r.quantity * nights, 0)
  const servicesTotal = selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0)
  const subtotal = roomsTotal + servicesTotal
  const tax = subtotal * 0.13
  const total = subtotal + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await createManualBooking({
        guestInfo: {
          email: formData.guestEmail,
          fullName: formData.guestName,
          phone: formData.guestPhone,
          nationality: formData.guestNationality,
        },
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guestsCount: formData.guestsCount,
        source: formData.source,
        specialRequests: formData.specialRequests,
        rooms: selectedRooms,
        services: selectedServices.map((s) => ({
          serviceId: s.serviceId,
          quantity: s.quantity,
          priceAtBooking: s.price,
        })),
        paymentStatus: formData.paymentStatus,
        paidAmount: formData.paidAmount,
      })

      router.push(`/admin/bookings`)
    } catch (err: any) {
      setError(err.message || "Error al crear la reserva")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Datos del Huesped
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestName">Nombre Completo *</Label>
                  <Input
                    id="guestName"
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestEmail">Email *</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={formData.guestEmail}
                    onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestPhone">Telefono</Label>
                  <Input
                    id="guestPhone"
                    value={formData.guestPhone}
                    onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestNationality">Nacionalidad</Label>
                  <Input
                    id="guestNationality"
                    value={formData.guestNationality}
                    onChange={(e) => setFormData({ ...formData, guestNationality: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Detalles de Reserva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Check-in *</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">Check-out *</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestsCount">Huespedes</Label>
                  <Input
                    id="guestsCount"
                    type="number"
                    min={1}
                    value={formData.guestsCount}
                    onChange={(e) => setFormData({ ...formData, guestsCount: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Origen de Reserva</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value: any) => setFormData({ ...formData, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walk_in">Walk-in</SelectItem>
                      <SelectItem value="phone">Telefono</SelectItem>
                      <SelectItem value="ota">OTA (Booking, Airbnb)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">Solicitudes Especiales</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Rooms Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-primary" />
                Habitaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRooms.map((selection, idx) => {
                const room = rooms.find((r) => r.id === selection.roomId)
                return (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{room?.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{room?.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">$/noche:</Label>
                      <Input
                        type="number"
                        className="w-24"
                        value={selection.pricePerNight}
                        onChange={(e) => updateRoomPrice(idx, Number.parseFloat(e.target.value))}
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeRoom(idx)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}

              <Select onValueChange={addRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Agregar habitacion..." />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} ({room.type}) - {room.beds?.length} camas
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Services Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Servicios Adicionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedServices.map((selection, idx) => {
                const service = services.find((s) => s.id === selection.serviceId)
                return (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{service?.name}</p>
                      <p className="text-sm text-muted-foreground">${selection.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const updated = [...selectedServices]
                          if (updated[idx].quantity > 1) {
                            updated[idx].quantity--
                            setSelectedServices(updated)
                          }
                        }}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center">{selection.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const updated = [...selectedServices]
                          updated[idx].quantity++
                          setSelectedServices(updated)
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeService(idx)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}

              <Select onValueChange={addService}>
                <SelectTrigger>
                  <SelectValue placeholder="Agregar servicio..." />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary & Payment */}
        <div className="space-y-6">
          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Estado de Pago</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value: any) => setFormData({ ...formData, paymentStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="partial">Parcial</SelectItem>
                    <SelectItem value="paid">Pagado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.paymentStatus !== "pending" && (
                <div className="space-y-2">
                  <Label htmlFor="paidAmount">Monto Pagado</Label>
                  <Input
                    id="paidAmount"
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: Number.parseFloat(e.target.value) })}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nights > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Noches</span>
                  <span>{nights}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Habitaciones</span>
                <span>${roomsTotal.toFixed(2)}</span>
              </div>
              {servicesTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Servicios</span>
                  <span>${servicesTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (13%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || selectedRooms.length === 0 || !formData.checkIn || !formData.checkOut}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Crear Reserva
            </Button>
            <Button type="button" variant="outline" className="w-full bg-transparent" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
