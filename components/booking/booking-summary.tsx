"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users, Bed, Sparkles } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import type { BookingData, BookingStep } from "./booking-flow";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";

interface BookingSummaryProps {
  bookingData: BookingData;
  nights: number;
  currentStep: BookingStep;
}

interface CachedSummary {
  nights: number;
  roomsTotal: number;
  extrasTotal: number;
  subtotal: number;
  tax: number;
  total: number;
}

export function BookingSummary({
  bookingData,
  nights,
  currentStep,
}: BookingSummaryProps) {
  const queryClient = useQueryClient();
  const cachedSummary = queryClient.getQueryData<CachedSummary>(
    queryKeys.bookingFlow.summary()
  );

  const roomsTotal =
    cachedSummary?.roomsTotal ??
    bookingData.rooms.reduce(
      (sum, room) => sum + room.pricePerNight * room.quantity * nights,
      0
    );
  const extrasTotal =
    cachedSummary?.extrasTotal ??
    bookingData.extras.reduce(
      (sum, extra) => sum + extra.price * extra.quantity,
      0
    );
  const subtotal = cachedSummary?.subtotal ?? roomsTotal + extrasTotal;
  const tax = cachedSummary?.tax ?? subtotal * 0.13;
  const total = cachedSummary?.total ?? subtotal + tax;
  const effectiveNights = cachedSummary?.nights ?? nights;

  return (
    <div className="sticky top-20 sm:top-24 lg:top-28">
      <Card className="border-0 shadow-lg overflow-hidden">
        {/* Header Image */}
        <div className="relative h-24 sm:h-32">
          <Image
            src="/perfect-waves-costa-rica-sunset-surfers-in-water.jpg"
            alt="Mai Ke Kai"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-heading text-lg font-bold text-white">
              Mai Ke Kai
            </h3>
            <p className="text-white/80 text-sm">Surf House, Costa Rica</p>
          </div>
        </div>

        <CardContent className="p-4 sm:p-5 space-y-3 sm:space-y-4">
          {/* Dates */}
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <CalendarDays className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {format(bookingData.checkIn, "MMM dd")} -{" "}
                {format(bookingData.checkOut, "MMM dd, yyyy")}
              </p>
              <p className="text-sm text-muted-foreground">
                {effectiveNights} nights
              </p>
            </div>
          </div>

          {/* Guests */}
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">
                {bookingData.guests} Guests
              </p>
            </div>
          </div>

          {/* Selected Rooms */}
          {bookingData.rooms.length > 0 && (
            <div className="pb-4 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <Bed className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground text-sm">
                  Accommodation
                </span>
              </div>
              <div className="space-y-2 pl-6">
                {bookingData.rooms.map((room) => (
                  <div
                    key={room.roomId}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {room.quantity}x {room.roomName}
                    </span>
                    <span className="font-medium">
                      $
                      {(room.pricePerNight * room.quantity * nights).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Extras */}
          {bookingData.extras.length > 0 && (
            <div className="pb-4 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground text-sm">
                  Extras
                </span>
              </div>
              <div className="space-y-2 pl-6">
                {bookingData.extras.map((extra) => (
                  <div
                    key={extra.serviceId}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {extra.quantity}x {extra.serviceName}
                    </span>
                    <span className="font-medium">
                      ${(extra.price * extra.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          {(roomsTotal > 0 || extrasTotal > 0) && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (13%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {bookingData.rooms.length === 0 && currentStep !== "search" && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Select a room to see your booking summary
            </p>
          )}
        </CardContent>
      </Card>

      {/* Trust Badges */}
      <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          Secure checkout
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Best price guarantee
        </span>
      </div>
    </div>
  );
}
