"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  User,
  CalendarDays,
  Bed,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Globe,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react"
import { format } from "date-fns"
import { adminProcessCheckIn, adminProcessCheckOut, markAsNoShow } from "@/lib/actions/admin-bookings"
import { cancelBooking } from "@/lib/actions/bookings"
import { recordManualPayment } from "@/lib/actions/payments"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const statusColors: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  checked_in: "bg-blue-100 text-blue-800",
  checked_out: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-orange-100 text-orange-800",
}

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  partial: "bg-orange-100 text-orange-800",
  paid: "bg-green-100 text-green-800",
  refunded: "bg-gray-100 text-gray-800",
}

interface BookingDetailsViewProps {
  booking: any
}

export function BookingDetailsView({ booking }: BookingDetailsViewProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(booking.total_amount - booking.paid_amount)

  const nights = Math.ceil(
    (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24),
  )

  const handleCheckIn = async () => {
    setIsLoading(true)
    try {
      await adminProcessCheckIn(booking.id)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setIsLoading(true)
    try {
      await adminProcessCheckOut(booking.id)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNoShow = async () => {
    setIsLoading(true)
    try {
      await markAsNoShow(booking.id)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      await cancelBooking(booking.id)
      setShowCancelDialog(false)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecordPayment = async () => {
    setIsLoading(true)
    try {
      await recordManualPayment(booking.id, paymentAmount, "manual")
      setShowPaymentDialog(false)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/bookings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold">Reserva #{booking.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-muted-foreground">
              Creada el {format(new Date(booking.created_at), "d MMM yyyy, HH:mm")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[booking.status]}>{booking.status.replace("_", " ")}</Badge>
          <Badge className={paymentStatusColors[booking.payment_status]}>{booking.payment_status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Informacion del Huesped
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{booking.users?.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Huespedes</p>
                  <p className="font-medium">{booking.guests_count}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{booking.users?.email}</span>
                </div>
                {booking.users?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{booking.users.phone}</span>
                  </div>
                )}
                {booking.users?.nationality && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span>{booking.users.nationality}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Detalles de Estancia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-medium">{format(new Date(booking.check_in), "d MMM yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-medium">{format(new Date(booking.check_out), "d MMM yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Noches</p>
                  <p className="font-medium">{nights}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Habitaciones</p>
                {booking.booking_rooms?.map((br: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded mb-2">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-primary" />
                      <span className="font-medium">{br.rooms?.name}</span>
                      {br.beds && <span className="text-sm text-muted-foreground">- Cama {br.beds.bed_number}</span>}
                    </div>
                    <span className="text-sm">${br.price_per_night}/noche</span>
                  </div>
                ))}
              </div>
              {booking.booking_services?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Servicios</p>
                    {booking.booking_services.map((bs: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded mb-2">
                        <span className="font-medium">{bs.services?.name}</span>
                        <span className="text-sm">
                          x{bs.quantity} - ${bs.price_at_booking}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {booking.special_requests && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Solicitudes Especiales</p>
                    <p className="mt-1">{booking.special_requests}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Check-in Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Estado del Check-in Online
              </CardTitle>
            </CardHeader>
            <CardContent>
              {booking.check_in_data?.completed_at ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Completado el {format(new Date(booking.check_in_data.completed_at), "d MMM yyyy, HH:mm")}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Clock className="w-5 h-5" />
                    <span>Pendiente</span>
                  </div>
                  <p className="text-sm text-muted-foreground">El huesped puede completar su check-in online en:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">/check-in/{booking.id}</code>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/check-in/${booking.id}`} target="_blank">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Payment & Actions */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">${booking.total_amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pagado</span>
                  <span className="font-medium text-green-600">${booking.paid_amount?.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Pendiente</span>
                  <span className="font-bold text-primary">
                    ${(booking.total_amount - booking.paid_amount).toFixed(2)}
                  </span>
                </div>
              </div>
              {booking.payment_status !== "paid" && (
                <Button className="w-full bg-transparent" variant="outline" onClick={() => setShowPaymentDialog(true)}>
                  Registrar Pago
                </Button>
              )}
              <p className="text-xs text-muted-foreground text-center">Origen: {booking.source}</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {booking.status === "confirmed" && (
                <Button className="w-full" onClick={handleCheckIn} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Procesar Check-in
                </Button>
              )}

              {booking.status === "checked_in" && (
                <Button className="w-full" onClick={handleCheckOut} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Procesar Check-out
                </Button>
              )}

              {["pending_payment", "confirmed"].includes(booking.status) && (
                <>
                  <Button
                    className="w-full bg-transparent"
                    variant="outline"
                    onClick={handleNoShow}
                    disabled={isLoading}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Marcar No-Show
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isLoading}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar Reserva
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>
              Esta accion cancelara la reserva y procesara un reembolso si corresponde.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Volver
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirmar Cancelacion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago Manual</DialogTitle>
            <DialogDescription>Registra un pago en efectivo, transferencia u otro metodo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto a Registrar</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number.parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Pendiente: ${(booking.total_amount - booking.paid_amount).toFixed(2)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRecordPayment} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Registrar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
