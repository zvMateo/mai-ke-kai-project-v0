"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CreditCard, Lock, Shield, Loader2 } from "lucide-react";
import { differenceInDays } from "date-fns";
import type { BookingData } from "./booking-flow";
import { createBookingWithCheckout } from "@/lib/actions/checkout";

interface PaymentStepProps {
  bookingData: BookingData;
  onComplete: (bookingId: string) => void;
  onBack: () => void;
}

export function PaymentStep({
  bookingData,
  onComplete,
  onBack,
}: PaymentStepProps) {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const completedRef = useRef(false);

  const nights = differenceInDays(bookingData.checkOut, bookingData.checkIn);
  const roomsTotal = bookingData.rooms.reduce(
    (sum, room) => sum + room.pricePerNight * room.quantity * nights,
    0
  );
  const extrasTotal = bookingData.extras.reduce(
    (sum, extra) => sum + extra.price * extra.quantity,
    0
  );
  const subtotal = roomsTotal + extrasTotal;
  const tax = subtotal * 0.13;
  const total = subtotal + tax;

  const handleGreenPayPayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // First create the booking
      const result = await createBookingWithCheckout({
        checkIn: bookingData.checkIn.toISOString().split("T")[0],
        checkOut: bookingData.checkOut.toISOString().split("T")[0],
        guestsCount: bookingData.guests,
        rooms: bookingData.rooms.map((room) => ({
          roomId: room.roomId,
          bedId: room.bedId,
          pricePerNight: room.pricePerNight,
        })),
        services: bookingData.extras.map((extra) => ({
          serviceId: extra.serviceId,
          quantity: extra.quantity,
          priceAtBooking: extra.price,
          scheduledDate: extra.date,
        })),
        specialRequests: bookingData.guestInfo?.specialRequests,
        guestInfo: {
          email: bookingData.guestInfo?.email || "",
          fullName: `${bookingData.guestInfo?.firstName || ""} ${
            bookingData.guestInfo?.lastName || ""
          }`.trim(),
          phone: bookingData.guestInfo?.phone,
          nationality: bookingData.guestInfo?.nationality,
        },
      });

      // Store booking ID for completion
      setBookingId(result.bookingId);

      // Create GreenPay payment
      const greenpayResponse = await fetch("/api/greenpay/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          currency: "USD",
          orderId: result.bookingId,
          description: `Reserva Mai Ke Kai House - ${result.bookingId.slice(
            0,
            8
          )}`,
          customerEmail: bookingData.guestInfo?.email || "",
          customerName: `${bookingData.guestInfo?.firstName || ""} ${
            bookingData.guestInfo?.lastName || ""
          }`.trim(),
          metadata: {
            bookingId: result.bookingId,
            hotel: "Mai Ke Kai House",
          },
          cardDetails: {
            cardNumber: "4111111111111111", // Test card number
            cardHolder: `${bookingData.guestInfo?.firstName || ""} ${
              bookingData.guestInfo?.lastName || ""
            }`.trim(),
            expirationDate: "12/25", // Test expiration
            cvv: "123", // Test CVV
          },
        }),
      });

      const greenpayData = await greenpayResponse.json().catch(() => {
        throw new Error("Error de comunicación con el servidor de pago");
      });

      if (!greenpayResponse.ok) {
        throw new Error(
          greenpayData.error || "Error al crear el pago con GreenPay"
        );
      }

      if (greenpayData.success) {
        // For GreenPay, payment is processed immediately
        // Redirect to success page
        window.location.href = `/booking/success?order=${result.bookingId}`;
      } else {
        throw new Error("No se pudo procesar el pago con GreenPay");
      }
    } catch (err) {
      console.error("Error creating GreenPay checkout:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al procesar el pago con GreenPay. Por favor intenta de nuevo."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!acceptTerms) return;
    handleGreenPayPayment();
  };

  return (
    <div className="space-y-6">
      {/* Order Summary Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Resumen del Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Booking Details */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Alojamiento</h4>
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

          {bookingData.extras.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">
                Extras & Servicios
              </h4>
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
          )}

          <hr className="border-border" />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA (13%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t">
              <span className="font-semibold">Total a Pagar</span>
              <span className="font-bold text-primary">
                ${total.toFixed(2)} USD
              </span>
            </div>
          </div>

          <hr className="border-border" />

          {/* Payment Method Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pago con GreenPay
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Procesamiento seguro con GreenPay</li>
              <li>• Acepta tarjetas Visa, Mastercard y más</li>
              <li>• Confirmación automática de reserva</li>
              <li>• Protección SSL y encriptación</li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Shield className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              Tu pago está protegido con encriptación SSL. Procesamos pagos de
              forma segura con GreenPay.
            </p>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
            >
              Acepto los{" "}
              <a href="/terminos" className="text-primary hover:underline">
                Términos de Servicio
              </a>{" "}
              y la{" "}
              <a href="/cancelacion" className="text-primary hover:underline">
                Política de Cancelación
              </a>
            </label>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Volver
        </Button>
        <Button
          onClick={handleProceedToPayment}
          disabled={!acceptTerms || isProcessing}
          size="lg"
          className="min-w-[200px]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Lock className="mr-2 w-4 h-4" />
              Pagar con GreenPay
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
