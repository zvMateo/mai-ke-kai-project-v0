"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PackagePreview } from "../package-preview";
import { RoomSelector } from "../room-selector";
import { ExtrasSelector } from "../extras-selector";
import { GuestDetails } from "../guest-details";
import { PaymentStep } from "../payment-step";
import { BookingConfirmation } from "../booking-confirmation";
import { BookingSummary } from "../booking-summary";
import { BookingFlowBase } from "../base/BookingFlowBase";
import { BookingFlowModal } from "../booking-flow-modal";
import type { StepConfig, RoomSelection, ExtraSelection } from "../base/types";

interface PackageFlowProps {
  initialCheckInISO: string;
  initialCheckOutISO: string;
  packageId: string;
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
    console.error("PackageFlow Error:", error, errorInfo);
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

const getActiveSteps = (packageData?: any): StepConfig[] => {
  const steps: StepConfig[] = [
    { key: "package-preview", label: "Resumen" },
  ];

  // Add rooms step if package includes accommodation (has room_type)
  if (packageData?.room_type) {
    steps.push({ key: "rooms", label: "Habitaciones" });
  }

  // Always add extras, details, and payment
  steps.push({ key: "extras", label: "Extras" });
  steps.push({ key: "details", label: "Datos" });
  steps.push({ key: "payment", label: "Pago" });

  return steps;
};

export function PackageFlow({
  initialCheckInISO,
  initialCheckOutISO,
  packageId,
}: PackageFlowProps) {
  const [packageData, setPackageData] = React.useState<any>(null);
  const [loadingPackage, setLoadingPackage] = React.useState(true);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);

  // Load package data on mount
  React.useEffect(() => {
    const loadPackage = async () => {
      try {
        const response = await fetch(`/api/packages/${packageId}`);
        if (!response.ok) throw new Error("Failed to fetch package");
        const pkg = await response.json();
        setPackageData(pkg);
      } catch (error) {
        console.error("Failed to load package:", error);
      } finally {
        setLoadingPackage(false);
      }
    };

    loadPackage();
  }, [packageId]);

  if (loadingPackage) {
    return (
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-foreground">Cargando paquete...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BookingFlowBase
      mode="package"
      initialCheckInISO={initialCheckInISO}
      initialCheckOutISO={initialCheckOutISO}
      initialGuests={packageData?.is_for_two ? 2 : 1}
      packageId={packageId}
      getActiveSteps={(mode, pkg) => getActiveSteps(pkg)}
      onPackageLoaded={setPackageData}
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
                    Reserva: {packageData?.name || "Paquete"}
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
                    {state.currentStep === "package-preview" && packageData && (
                      <PackagePreview
                        packageData={packageData}
                        onContinue={() => {
                          const nextIndex =
                            state.activeSteps.findIndex((s) => s.key === "package-preview") + 1;
                          const nextStep = state.activeSteps[nextIndex]?.key || "extras";
                          state.setCurrentStep(nextStep);
                        }}
                        onBack={state.goBack}
                      />
                    )}

                    {state.currentStep === "rooms" && packageData?.room_type && (
                      <RoomSelector
                        checkIn={state.bookingData.checkIn}
                        checkOut={state.bookingData.checkOut}
                        guests={state.bookingData.guests}
                        selectedRooms={state.bookingData.rooms}
                        onComplete={(rooms: RoomSelection[]) => {
                          state.setBookingData((prev) => ({ ...prev, rooms }));
                          state.setCurrentStep("extras");
                        }}
                        onBack={state.goBack}
                      />
                    )}

                    {state.currentStep === "extras" && (
                      <ExtrasSelector
                        checkIn={state.bookingData.checkIn}
                        checkOut={state.bookingData.checkOut}
                        selectedExtras={state.bookingData.extras}
                        mode="package"
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
                          setShowConfirmModal(true);
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

            {/* Confirmation Modal */}
            <BookingFlowModal
              isOpen={showConfirmModal}
              onClose={() => setShowConfirmModal(false)}
              onConfirm={() => {
                setShowConfirmModal(false);
                state.setCurrentStep("payment");
              }}
              mode="package"
              bookingData={state.bookingData}
              nights={state.nights}
            />
          </ErrorBoundary>
        );
      }}
    </BookingFlowBase>
  );
}
