"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ServiceOnlySelector } from "../service-only-selector";
import { ExtrasSelector } from "../extras-selector";
import { GuestDetails } from "../guest-details";
import { PaymentStep } from "../payment-step";
import { BookingConfirmation } from "../booking-confirmation";
import { BookingSummary } from "../booking-summary";
import { BookingFlowBase } from "../base/BookingFlowBase";
import type { StepConfig, ExtraSelection } from "../base/types";

interface ServiceOnlyFlowProps {
  initialCheckInISO: string;
  initialCheckOutISO: string;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ServiceOnlyFlow Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 text-red-600 rounded-lg">
          <h2 className="font-bold mb-2">Something went wrong</h2>
          <p className="text-sm">{this.state.error?.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
            Reload Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

const getActiveSteps = (): StepConfig[] => [
  { key: "service-select", label: "Servicios" },
  { key: "extras", label: "Extras" },
  { key: "details", label: "Datos" },
  { key: "payment", label: "Pago" },
];

export function ServiceOnlyFlow({
  initialCheckInISO,
  initialCheckOutISO,
}: ServiceOnlyFlowProps) {
  const router = useRouter();

  const goBackToSurfSection = () => {
    router.push("/#surf");
  };

  return (
    <BookingFlowBase
      mode="services-only"
      initialCheckInISO={initialCheckInISO}
      initialCheckOutISO={initialCheckOutISO}
      initialGuests={1}
      getActiveSteps={(mode) => getActiveSteps()}
    >
      {(state) => {
        if (state.currentStep === "confirmation" && state.bookingId) {
          return (
            <BookingConfirmation
              bookingId={state.bookingId}
              bookingData={state.bookingData}
            />
          );
        }

        return (
          <ErrorBoundary>
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                {/* Progress Header */}
                <div className="mb-6 sm:mb-8">
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                    Reserva Servicios
                  </h1>
                  <div className="flex items-center gap-2 sm:gap-4 mb-4 overflow-x-auto pb-2">
                    {state.activeSteps.map((step, idx) => (
                      <div key={step.key} className="flex items-center">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                            idx <= state.activeSteps.findIndex((s) => s.key === state.currentStep)
                              ? "bg-primary text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span
                          className={`ml-1 sm:ml-2 text-xs sm:text-sm hidden md:block whitespace-nowrap ${
                            idx <= state.activeSteps.findIndex((s) => s.key === state.currentStep)
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                        {idx < state.activeSteps.length - 1 && (
                          <div
                            className={`w-4 sm:w-8 md:w-12 lg:w-16 h-0.5 mx-1 sm:mx-2 shrink-0 ${
                              idx < state.activeSteps.findIndex((s) => s.key === state.currentStep)
                                ? "bg-primary"
                                : "bg-muted"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <Progress value={state.progress} className="h-1" />
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  <div className="lg:col-span-2">
                    {state.currentStep === "service-select" && (
                      <ServiceOnlySelector
                        selectedExtras={state.bookingData.extras}
                        serviceDates={state.bookingData.serviceDates || {}}
                        onComplete={(data) => {
                          state.setBookingData((prev) => ({
                            ...prev,
                            checkIn: data.checkIn,
                            checkOut: data.checkOut,
                            extras: data.extras,
                            serviceDates: data.serviceDates,
                          }));
                          state.setCurrentStep("extras");
                        }}
                        onBack={goBackToSurfSection}
                      />
                    )}

                    {state.currentStep === "extras" && (
                      <ExtrasSelector
                        checkIn={state.bookingData.checkIn}
                        checkOut={state.bookingData.checkOut}
                        selectedExtras={state.bookingData.extras}
                        mode="services-only"
                        onComplete={(extras: ExtraSelection[]) => {
                          state.setBookingData((prev) => ({ ...prev, extras }));
                          state.setCurrentStep("details");
                        }}
                        onBack={state.goBack}
                      />
                    )}

                    {state.currentStep === "details" && (
                      <GuestDetails
                        initialData={state.bookingData.guestInfo}
                        onComplete={(guestInfo) => {
                          state.setBookingData((prev) => ({ ...prev, guestInfo }));
                          state.setCurrentStep("payment");
                        }}
                        onBack={state.goBack}
                      />
                    )}

                    {state.currentStep === "payment" && (
                      <PaymentStep
                        bookingData={state.bookingData}
                        onComplete={(id: string) => {
                          state.setBookingId(id);
                          state.setCurrentStep("confirmation");
                        }}
                        onBack={state.goBack}
                      />
                    )}
                  </div>

                  <div className="lg:col-span-1">
                    <BookingSummary
                      bookingData={state.bookingData}
                      nights={state.nights}
                      currentStep={state.currentStep}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ErrorBoundary>
        );
      }}
    </BookingFlowBase>
  );
}
