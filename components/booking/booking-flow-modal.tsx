"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Bed, Package, Waves } from "lucide-react";
import type { BookingData, BookingMode } from "./base/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BookingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mode: BookingMode;
  bookingData: BookingData;
  nights: number;
}

export function BookingFlowModal({
  isOpen,
  onClose,
  onConfirm,
  mode,
  bookingData,
  nights,
}: BookingFlowModalProps) {
  const getModeTitle = () => {
    switch (mode) {
      case "accommodation":
        return "Confirmar Reserva de Alojamiento";
      case "room-select":
        return "Confirmar Reserva de Habitación";
      case "services-only":
        return "Confirmar Reserva de Servicios";
      case "package":
        return "Confirmar Paquete";
      default:
        return "Confirmar Reserva";
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case "accommodation":
        return "Está a punto de confirmar su reserva de alojamiento. Por favor revise los detalles antes de proceder al pago.";
      case "room-select":
        return "Ha seleccionado una habitación específica. Por favor revise los detalles antes de proceder.";
      case "services-only":
        return "Está a punto de reservar solo servicios, sin alojamiento. Revise los detalles antes de continuar.";
      case "package":
        return "Ha seleccionado un paquete completo. Revise los detalles incluidos antes de proceder al pago.";
      default:
        return "Por favor revise los detalles de su reserva.";
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case "accommodation":
      case "room-select":
        return <Bed className="w-5 h-5 text-primary" />;
      case "services-only":
        return <Waves className="w-5 h-5 text-primary" />;
      case "package":
        return <Package className="w-5 h-5 text-primary" />;
      default:
        return null;
    }
  };

  // Calculate totals
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getModeIcon()}
            <DialogTitle className="text-2xl">{getModeTitle()}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {getModeDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Booking Dates */}
          {mode !== "services-only" && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Fechas de Reserva
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-medium">
                    {format(bookingData.checkIn, "PPP", { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-medium">
                    {format(bookingData.checkOut, "PPP", { locale: es })}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm">
                  <span className="font-semibold">{nights}</span> noche{nights !== 1 ? "s" : ""}
                  {" • "}
                  <span className="font-semibold">{bookingData.guests}</span> huésped{bookingData.guests !== 1 ? "es" : ""}
                </p>
              </div>
            </div>
          )}

          {/* Rooms */}
          {bookingData.rooms.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bed className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Habitaciones Seleccionadas
                </h3>
              </div>
              <div className="space-y-2">
                {bookingData.rooms.map((room, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-muted/30 rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium">{room.roomName}</p>
                      <p className="text-sm text-muted-foreground">
                        {room.quantity} × ${room.pricePerNight} / noche
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${room.pricePerNight * room.quantity * nights}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {nights} noche{nights !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services/Extras */}
          {bookingData.extras.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Waves className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Servicios y Extras
                </h3>
              </div>
              <div className="space-y-2">
                {bookingData.extras.map((extra, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-muted/30 rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium">{extra.serviceName}</p>
                      <p className="text-sm text-muted-foreground">
                        Cantidad: {extra.quantity}
                        {extra.date && (
                          <span className="ml-2">
                            • {format(new Date(extra.date), "PPP", { locale: es })}
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="font-semibold">${extra.price * extra.quantity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Package Info */}
          {bookingData.packageData && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-primary">Paquete Incluido</h3>
              </div>
              <p className="font-medium text-lg mb-2">{bookingData.packageData.name}</p>
              {bookingData.packageData.includes && bookingData.packageData.includes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {bookingData.packageData.includes.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Price Summary */}
          <div className="border-t border-border pt-4">
            <div className="space-y-2">
              {roomsTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Alojamiento</span>
                  <span className="font-medium">${roomsTotal.toFixed(2)}</span>
                </div>
              )}
              {extrasTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Servicios y Extras</span>
                  <span className="font-medium">${extrasTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Impuestos (13%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} type="button">
            Revisar Reserva
          </Button>
          <Button onClick={onConfirm} type="button" className="min-w-[120px]">
            Proceder al Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
