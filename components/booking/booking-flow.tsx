"use client";

import { AccommodationFlow } from "./flows/AccommodationFlow";
import { RoomSelectFlow } from "./flows/RoomSelectFlow";
import { ServiceOnlyFlow } from "./flows/ServiceOnlyFlow";
import { PackageFlow } from "./flows/PackageFlow";

// Re-export types for backward compatibility
export type {
  BookingData,
  BookingStep,
  RoomSelection,
  ExtraSelection,
} from "./base/types";

export type BookingMode = "accommodation" | "room-select" | "services-only" | "package";

interface BookingFlowProps {
  initialCheckInISO: string;
  initialCheckOutISO: string;
  initialGuests?: number;
  mode?: BookingMode;
  packageId?: string;
  serviceId?: string;
  roomId?: string;
  roomName?: string;
}

/**
 * BookingFlow Router Component
 * 
 * This component acts as a dispatcher that routes to the appropriate booking flow
 * based on the booking mode:
 * 
 * - "accommodation": Standard accommodation booking (widget entry point)
 * - "room-select": Room-specific booking (room card entry point)
 * - "services-only": Services-only booking (surf section entry point)
 * - "package": Package booking (packages section entry point)
 */
export function BookingFlow({
  initialCheckInISO,
  initialCheckOutISO,
  initialGuests = 2,
  mode = "accommodation",
  packageId,
  serviceId,
  roomId,
  roomName,
}: BookingFlowProps) {
  // Route to appropriate flow based on mode
  if (mode === "room-select" && roomId && roomName) {
    return (
      <RoomSelectFlow
        initialCheckInISO={initialCheckInISO}
        initialCheckOutISO={initialCheckOutISO}
        initialGuests={initialGuests}
        roomId={roomId}
        roomName={roomName}
      />
    );
  }

  if (mode === "services-only") {
    return (
      <ServiceOnlyFlow
        initialCheckInISO={initialCheckInISO}
        initialCheckOutISO={initialCheckOutISO}
        serviceId={serviceId}
      />
    );
  }

  if (mode === "package" && packageId) {
    return (
      <PackageFlow
        initialCheckInISO={initialCheckInISO}
        initialCheckOutISO={initialCheckOutISO}
        packageId={packageId}
      />
    );
  }

  // Default to accommodation flow
  return (
    <AccommodationFlow
      initialCheckInISO={initialCheckInISO}
      initialCheckOutISO={initialCheckOutISO}
      initialGuests={initialGuests}
    />
  );
}
