"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { addDays, differenceInDays } from "date-fns"
import { BookingSearch } from "./booking-search"
import { RoomSelector } from "./room-selector"
import { ExtrasSelector } from "./extras-selector"
import { BookingSummary } from "./booking-summary"
import { GuestDetails } from "./guest-details"
import { PaymentStep } from "./payment-step"
import { BookingConfirmation } from "./booking-confirmation"
import { Progress } from "@/components/ui/progress"

export type BookingStep = "search" | "rooms" | "extras" | "details" | "payment" | "confirmation"

export interface RoomSelection {
  roomId: string
  roomName: string
  bedId?: string
  quantity: number
  pricePerNight: number
  sellUnit: "bed" | "room"
}

export interface ExtraSelection {
  serviceId: string
  serviceName: string
  quantity: number
  price: number
  date?: string
}

export interface BookingData {
  checkIn: Date
  checkOut: Date
  guests: number
  rooms: RoomSelection[]
  extras: ExtraSelection[]
  guestInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    nationality: string
    specialRequests?: string
  } | null
}

const steps: { key: BookingStep; label: string }[] = [
  { key: "search", label: "Fechas" },
  { key: "rooms", label: "Habitaciones" },
  { key: "extras", label: "Extras" },
  { key: "details", label: "Datos" },
  { key: "payment", label: "Pago" },
]

export function BookingFlow() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<BookingStep>("search")
  const [bookingData, setBookingData] = useState<BookingData>({
    checkIn: addDays(new Date(), 7),
    checkOut: addDays(new Date(), 10),
    guests: 2,
    rooms: [],
    extras: [],
    guestInfo: null,
  })
  const [bookingId, setBookingId] = useState<string | null>(null)

  // Parse URL params on mount
  useEffect(() => {
    const checkIn = searchParams.get("checkIn")
    const checkOut = searchParams.get("checkOut")
    const guests = searchParams.get("guests")

    if (checkIn && checkOut) {
      setBookingData((prev) => ({
        ...prev,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests: guests ? Number.parseInt(guests) : 2,
      }))
      setCurrentStep("rooms")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const stepIndex = steps.findIndex((s) => s.key === currentStep)
  const progress = ((stepIndex + 1) / steps.length) * 100

  const nights = differenceInDays(bookingData.checkOut, bookingData.checkIn)

  const handleSearchComplete = (data: Pick<BookingData, "checkIn" | "checkOut" | "guests">) => {
    setBookingData((prev) => ({ ...prev, ...data }))
    setCurrentStep("rooms")
  }

  const handleRoomsComplete = (rooms: RoomSelection[]) => {
    setBookingData((prev) => ({ ...prev, rooms }))
    setCurrentStep("extras")
  }

  const handleExtrasComplete = (extras: ExtraSelection[]) => {
    setBookingData((prev) => ({ ...prev, extras }))
    setCurrentStep("details")
  }

  const handleDetailsComplete = (guestInfo: BookingData["guestInfo"]) => {
    setBookingData((prev) => ({ ...prev, guestInfo }))
    setCurrentStep("payment")
  }

  const handlePaymentComplete = (id: string) => {
    setBookingId(id)
    setCurrentStep("confirmation")
  }

  const goBack = () => {
    const currentIndex = steps.findIndex((s) => s.key === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key)
    }
  }

  if (currentStep === "confirmation" && bookingId) {
    return <BookingConfirmation bookingId={bookingId} bookingData={bookingData} />
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-4">Reserva Tu Estancia</h1>
          <div className="flex items-center gap-4 mb-4">
            {steps.map((step, idx) => (
              <div key={step.key} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    idx <= stepIndex ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`ml-2 text-sm hidden sm:block ${
                    idx <= stepIndex ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
                {idx < steps.length - 1 && (
                  <div className={`w-8 md:w-16 h-0.5 mx-2 ${idx < stepIndex ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Steps */}
          <div className="lg:col-span-2">
            {currentStep === "search" && <BookingSearch initialData={bookingData} onComplete={handleSearchComplete} />}
            {currentStep === "rooms" && (
              <RoomSelector
                checkIn={bookingData.checkIn}
                checkOut={bookingData.checkOut}
                guests={bookingData.guests}
                selectedRooms={bookingData.rooms}
                onComplete={handleRoomsComplete}
                onBack={goBack}
              />
            )}
            {currentStep === "extras" && (
              <ExtrasSelector
                checkIn={bookingData.checkIn}
                checkOut={bookingData.checkOut}
                selectedExtras={bookingData.extras}
                onComplete={handleExtrasComplete}
                onBack={goBack}
              />
            )}
            {currentStep === "details" && (
              <GuestDetails initialData={bookingData.guestInfo} onComplete={handleDetailsComplete} onBack={goBack} />
            )}
            {currentStep === "payment" && (
              <PaymentStep bookingData={bookingData} onComplete={handlePaymentComplete} onBack={goBack} />
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <BookingSummary bookingData={bookingData} nights={nights} currentStep={currentStep} />
          </div>
        </div>
      </div>
    </div>
  )
}
