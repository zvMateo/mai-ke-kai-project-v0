"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, CalendarDays, Users, MapPin, Mail, Phone, Download, CreditCard, Bed, Sparkles, Loader2 } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import type { BookingData } from "./booking-flow"

interface BookingConfirmationProps {
  bookingId: string
  bookingData: BookingData
}

export function BookingConfirmation({ bookingId, bookingData }: BookingConfirmationProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const nights = differenceInDays(bookingData.checkOut, bookingData.checkIn)
  
  const roomsTotal = bookingData.rooms.reduce(
    (sum, room) => sum + room.pricePerNight * room.quantity * nights,
    0
  )
  
  const servicesTotal = bookingData.extras.reduce(
    (sum, extra) => sum + extra.price * extra.quantity,
    0
  )
  
  const subtotal = roomsTotal + servicesTotal
  const tax = subtotal * 0.13
  const total = subtotal + tax

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/receipt`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `reserva-${bookingId.slice(0, 8).toUpperCase()}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        window.print()
      }
    } catch {
      window.print()
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Header */}
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">¡Reserva Confirmada!</h1>
        <p className="text-muted-foreground mb-2">Tu aventura de surf en Mai Ke Kai está reservada</p>
        <p className="text-sm text-muted-foreground mb-8">Confirmación #{bookingId.slice(0, 8).toUpperCase()}</p>

        {/* Confirmation Card */}
        <Card className="border-0 shadow-xl mb-8 text-left">
          <CardContent className="p-0">
            {/* Image Header */}
            <div className="relative h-48">
              <Image
                src="/beautiful-costa-rica-surf-beach-with-palm-trees-an.jpg"
                alt="Mai Ke Kai Surf House"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <Image
                  src="/images/mai-20ke-20kai-20-20isotipo-20-20original.png"
                  alt="Mai Ke Kai"
                  width={48}
                  height={48}
                  className="brightness-0 invert"
                />
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Dates */}
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <CalendarDays className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {format(bookingData.checkIn, "EEEE, d 'de' MMMM")} - {format(bookingData.checkOut, "d 'de' MMMM 'de' yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">{nights} noches | Check-in: 3:00 PM | Check-out: 11:00 AM</p>
                </div>
              </div>

              {/* Guest Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {bookingData.guests} {bookingData.guests === 1 ? "Huésped" : "Huéspedes"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {bookingData.guestInfo?.firstName} {bookingData.guestInfo?.lastName}
                  </p>
                </div>
              </div>

              {/* Rooms */}
              {bookingData.rooms.length > 0 && (
                <div className="border-b border-border">
                  <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Bed className="w-4 h-4 text-primary" />
                    Habitaciones
                  </h3>
                  <div className="space-y-2">
                    {bookingData.rooms.map((room, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {room.roomName} x {room.quantity} ({nights} noches)
                        </span>
                        <span className="font-medium">
                          ${(room.pricePerNight * room.quantity * nights).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services/Extras */}
              {bookingData.extras.length > 0 && (
                <div className="border-b border-border">
                  <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Servicios Adicionales
                  </h3>
                  <div className="space-y-2">
                    {bookingData.extras.map((extra, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {extra.serviceName} x {extra.quantity}
                        </span>
                        <span className="font-medium">
                          ${(extra.price * extra.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA (13%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-border">
                  <span className="font-semibold">Total Pagado</span>
                  <span className="font-bold text-primary">${total.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Pago confirmado</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4 pt-2">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Mai Ke Kai Surf House</p>
                  <p className="text-sm text-muted-foreground">Playa Tamarindo, Guanacaste, Costa Rica</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">¿Qué sigue?</h3>
            <div className="space-y-3 text-left text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-muted-foreground">
                  Se ha enviado un email de confirmación a{" "}
                  <span className="text-foreground font-medium">{bookingData.guestInfo?.email}</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-muted-foreground">
                  Recuerda completar tu check-in online 24h antes de tu llegada para una experiencia más rápida.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-muted-foreground">
                  ¿Necesitas transporte desde el aeropuerto? Contáctanos al <span className="text-foreground font-medium">+506 8888-8888</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            className="gap-2 bg-transparent"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descargar Comprobante
              </>
            )}
          </Button>
          <Link href="/dashboard">
            <Button>Ver Mis Reservas</Button>
          </Link>
        </div>

        {/* Back to Home */}
        <div className="mt-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}