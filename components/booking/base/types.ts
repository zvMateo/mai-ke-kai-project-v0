/**
 * Shared types for all booking flows
 */

export type BookingMode = 
  | "accommodation" 
  | "room-select" 
  | "services-only" 
  | "package";

export type BookingStep =
  | "search"
  | "rooms"
  | "service-select"
  | "accommodation-suggestion"
  | "package-preview"
  | "package-dates"
  | "extras"
  | "details"
  | "payment"
  | "confirmation";

export interface RoomSelection {
  roomId: string;
  roomName: string;
  bedId?: string;
  quantity: number;
  pricePerNight: number;
  sellUnit: "bed" | "room";
}

export interface ExtraSelection {
  serviceId: string;
  serviceName: string;
  quantity: number;
  price: number;
  date?: string;
}

export interface BookingData {
  checkIn: Date;
  checkOut: Date;
  guests: number;
  rooms: RoomSelection[];
  extras: ExtraSelection[];
  serviceDates?: Record<string, string>;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality: string;
    specialRequests?: string;
  } | null;
  packageData?: {
    id: string;
    name: string;
    nights?: number;
    includes?: string[];
  };
}

export type SerializedBookingData = Omit<BookingData, "checkIn" | "checkOut"> & {
  checkIn: string;
  checkOut: string;
};

export interface BookingDraft {
  step: BookingStep;
  mode: BookingMode;
  packageId?: string;
  roomId?: string;
  roomName?: string;
  data: SerializedBookingData;
}

export interface StepConfig {
  key: BookingStep;
  label: string;
}

export interface BookingFlowBaseProps {
  initialCheckInISO: string;
  initialCheckOutISO: string;
  initialGuests?: number;
  mode: BookingMode;
  packageId?: string;
  roomId?: string;
  roomName?: string;
}

export interface BookingFlowContextType {
  currentStep: BookingStep;
  bookingData: BookingData;
  activeSteps: StepConfig[];
  progress: number;
  nights: number;
  summary: {
    nights: number;
    roomsTotal: number;
    extrasTotal: number;
    subtotal: number;
    tax: number;
    total: number;
  };
  setCurrentStep: (step: BookingStep) => void;
  setBookingData: (data: BookingData | ((prev: BookingData) => BookingData)) => void;
  goBack: () => void;
  goNext: () => void;
  bookingId: string | null;
  setBookingId: (id: string) => void;
  packageData?: any;
  loadingPackage?: boolean;
}
