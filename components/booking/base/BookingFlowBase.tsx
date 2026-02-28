"use client";

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { differenceInDays } from "date-fns";
import { queryKeys } from "@/lib/queries";
import {
  BookingData,
  BookingDraft,
  BookingMode,
  BookingStep,
  StepConfig,
  SerializedBookingData,
} from "./types";

// Helper to parse ISO date string to local Date
const parseISODateToLocal = (dateStr: string): Date => {
  // Check if the date string has timezone info (Z suffix)
  if (dateStr.includes("Z")) {
    // For UTC dates, parse and keep the same calendar date
    const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  // For local dates without timezone, parse normally
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

interface BookingFlowBaseProps {
  mode: BookingMode;
  initialCheckInISO: string;
  initialCheckOutISO: string;
  initialGuests?: number;
  packageId?: string;
  roomId?: string;
  roomName?: string;
  children: (state: {
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
    setBookingData: (
      data: BookingData | ((prev: BookingData) => BookingData),
    ) => void;
    goBack: () => void;
    goNext: () => void;
    bookingId: string | null;
    setBookingId: (id: string) => void;
    packageData?: any;
    loadingPackage?: boolean;
  }) => ReactNode;
  getActiveSteps: (mode: BookingMode, packageData?: any) => StepConfig[];
  onPackageLoaded?: (pkg: any) => void;
}

export function BookingFlowBase({
  mode,
  initialCheckInISO,
  initialCheckOutISO,
  initialGuests = 2,
  packageId,
  roomId,
  roomName,
  children,
  getActiveSteps,
  onPackageLoaded,
}: BookingFlowBaseProps) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  const draftRef = useRef<BookingDraft | null>(null);

  // Get or create draft
  if (draftRef.current === null) {
    draftRef.current =
      queryClient.getQueryData<BookingDraft>(queryKeys.bookingFlow.draft()) ??
      null;
  }

  const createDefaultBookingData = useCallback(
    (): BookingData => ({
      checkIn: parseISODateToLocal(initialCheckInISO),
      checkOut: parseISODateToLocal(initialCheckOutISO),
      guests: initialGuests,
      rooms: [],
      extras: [],
      serviceDates: {},
      guestInfo: null,
      packageData: undefined,
    }),
    [initialCheckInISO, initialCheckOutISO, initialGuests],
  );

  const deserializeDraft = useCallback(
    (draft: BookingDraft | null): BookingData => {
      if (!draft) {
        return createDefaultBookingData();
      }

      try {
        return {
          ...draft.data,
          checkIn: parseISODateToLocal(draft.data.checkIn),
          checkOut: parseISODateToLocal(draft.data.checkOut),
        };
      } catch (e) {
        console.error("Error deserializing draft:", e);
        return createDefaultBookingData();
      }
    },
    [createDefaultBookingData],
  );

  // Determinar paso inicial basado en el modo
  // Si hay draft pero el modo cambió, ignorar el step del draft
  const getInitialStep = (): BookingStep => {
    const steps = getActiveSteps(mode);
    const validStepKeys = steps.map((s) => s.key);

    if (draftRef.current && draftRef.current.mode === mode) {
      // Only use draft step if it exists in the current active steps
      // (handles case where skipSearch removes "search" but draft has it)
      if (validStepKeys.includes(draftRef.current.step)) {
        return draftRef.current.step;
      }
    }

    // Default to the first step from getActiveSteps
    return steps[0]?.key || "search";
  };

  const [currentStep, setCurrentStep] = useState<BookingStep>(getInitialStep());
  const [bookingData, setBookingData] = useState<BookingData>(() =>
    deserializeDraft(draftRef.current),
  );
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [packageData, setPackageData] = useState<any>(null);
  const [loadingPackage, setLoadingPackage] = useState(
    packageId ? true : false,
  );

  const hasDraft = Boolean(draftRef.current);

  // Limpiar draft si el modo cambió
  useEffect(() => {
    if (draftRef.current && draftRef.current.mode !== mode) {
      queryClient.removeQueries({ queryKey: queryKeys.bookingFlow.draft() });
      draftRef.current = null;
    }
  }, [mode, queryClient]);

  // Load package data if in package mode
  // NOTE: We only load the package metadata and set packageData on bookingData.
  // Dates and guests are NOT pre-populated here — the user picks them
  // in the PackageDateSelector step.
  useEffect(() => {
    if (mode !== "package" || !packageId) return;

    const loadPackage = async () => {
      try {
        const response = await fetch(`/api/packages/${packageId}`);
        if (!response.ok) throw new Error("Failed to fetch package");
        const pkg = await response.json();
        setPackageData(pkg);

        // Only set package metadata on bookingData (no dates, no guests)
        setBookingData((prev) => ({
          ...prev,
          packageData: {
            id: pkg.id,
            name: pkg.name,
            nights: pkg.nights,
            includes: pkg.includes || [],
          },
        }));

        // Set initial step based on package content
        const activeSteps = getActiveSteps("package", pkg);
        const firstStep = activeSteps[0]?.key || "extras";
        setCurrentStep(firstStep);

        onPackageLoaded?.(pkg);
      } catch (error) {
        console.error("Failed to load package:", error);
      } finally {
        setLoadingPackage(false);
      }
    };

    loadPackage();
  }, [mode, packageId, getActiveSteps, onPackageLoaded]);

  // Parse URL params on mount
  useEffect(() => {
    const currentDraft = draftRef.current;
    const draftModeMatches = currentDraft && currentDraft.mode === mode;

    if (draftModeMatches || mode === "package" || mode === "room-select")
      return;

    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guests = searchParams.get("guests");

    if (checkIn && checkOut) {
      setBookingData((prev) => ({
        ...prev,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests: guests ? Number.parseInt(guests) : 2,
      }));
    }
  }, [mode, searchParams]);

  const activeSteps = getActiveSteps(mode, packageData);
  const stepIndex = activeSteps.findIndex((s) => s.key === currentStep);
  const progress =
    stepIndex >= 0 ? ((stepIndex + 1) / activeSteps.length) * 100 : 0;

  const nights = differenceInDays(bookingData.checkOut, bookingData.checkIn);

  const summary = useMemo(() => {
    const roomsTotal = bookingData.rooms.reduce(
      (sum, room) => sum + room.pricePerNight * room.quantity * nights,
      0,
    );
    const extrasTotal = bookingData.extras.reduce(
      (sum, extra) => sum + extra.price * extra.quantity,
      0,
    );
    const subtotal = roomsTotal + extrasTotal;
    const tax = subtotal * 0.13;
    const total = subtotal + tax;

    return {
      nights,
      roomsTotal,
      extrasTotal,
      subtotal,
      tax,
      total,
    };
  }, [bookingData.rooms, bookingData.extras, nights]);

  // Persist draft
  useEffect(() => {
    const serializedDraft: BookingDraft = {
      step: currentStep,
      mode,
      packageId,
      roomId,
      roomName,
      data: {
        ...bookingData,
        rooms: bookingData.rooms,
        extras: bookingData.extras,
        serviceDates: bookingData.serviceDates || {},
        guestInfo: bookingData.guestInfo,
        packageData: bookingData.packageData,
        checkIn: bookingData.checkIn.toISOString(),
        checkOut: bookingData.checkOut.toISOString(),
      },
    };

    queryClient.setQueryData<BookingDraft>(
      queryKeys.bookingFlow.draft(),
      serializedDraft,
    );
  }, [
    bookingData,
    currentStep,
    queryClient,
    mode,
    packageId,
    roomId,
    roomName,
  ]);

  // Persist summary
  useEffect(() => {
    queryClient.setQueryData(queryKeys.bookingFlow.summary(), summary);
  }, [queryClient, summary]);

  const goBack = useCallback(() => {
    const currentIndex = activeSteps.findIndex((s) => s.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(activeSteps[currentIndex - 1].key);
    }
  }, [activeSteps, currentStep]);

  const goNext = useCallback(() => {
    const currentIndex = activeSteps.findIndex((s) => s.key === currentStep);
    if (currentIndex < activeSteps.length - 1) {
      setCurrentStep(activeSteps[currentIndex + 1].key);
    }
  }, [activeSteps, currentStep]);

  return (
    <>
      {children({
        currentStep,
        bookingData,
        activeSteps,
        progress,
        nights,
        summary,
        setCurrentStep,
        setBookingData,
        goBack,
        goNext,
        bookingId,
        setBookingId,
        packageData,
        loadingPackage,
      })}
    </>
  );
}
