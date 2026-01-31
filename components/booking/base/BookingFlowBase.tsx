"use client";

import { useState, useEffect, useMemo, useRef, useCallback, ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { addDays, differenceInDays } from "date-fns";
import { queryKeys } from "@/lib/queries";
import {
  BookingData,
  BookingDraft,
  BookingMode,
  BookingStep,
  StepConfig,
  SerializedBookingData,
} from "./types";

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
    setBookingData: (data: BookingData | ((prev: BookingData) => BookingData)) => void;
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

  const createDefaultBookingData = useCallback((): BookingData => ({
    checkIn: new Date(initialCheckInISO),
    checkOut: new Date(initialCheckOutISO),
    guests: initialGuests,
    rooms: [],
    extras: [],
    serviceDates: {},
    guestInfo: null,
    packageData: undefined,
  }), [initialCheckInISO, initialCheckOutISO, initialGuests]);

  const deserializeDraft = useCallback((draft: BookingDraft | null): BookingData => {
    if (!draft) {
      return createDefaultBookingData();
    }

    try {
      return {
        ...draft.data,
        checkIn: new Date(draft.data.checkIn),
        checkOut: new Date(draft.data.checkOut),
      };
    } catch (e) {
      console.error("Error deserializing draft:", e);
      return createDefaultBookingData();
    }
  }, [createDefaultBookingData]);

  const [currentStep, setCurrentStep] = useState<BookingStep>(
    draftRef.current?.step ??
      (mode === "services-only" ? "service-select" : "search")
  );
  const [bookingData, setBookingData] = useState<BookingData>(() =>
    deserializeDraft(draftRef.current)
  );
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [packageData, setPackageData] = useState<any>(null);
  const [loadingPackage, setLoadingPackage] = useState(packageId ? true : false);

  const hasDraft = Boolean(draftRef.current);

  // Load package data if in package mode
  useEffect(() => {
    if (mode !== "package" || !packageId) return;

    const loadPackage = async () => {
      try {
        const response = await fetch(`/api/packages/${packageId}`);
        if (!response.ok) throw new Error("Failed to fetch package");
        const pkg = await response.json();
        setPackageData(pkg);

        // Pre-populate booking data based on package
        setBookingData((prev) => {
          const updated = { ...prev };

          if (pkg.nights && pkg.nights > 0) {
            const now = new Date();
            updated.checkIn = now;
            updated.checkOut = addDays(now, pkg.nights);
          }

          if (pkg.is_for_two) {
            updated.guests = 2;
          }

          updated.packageData = {
            id: pkg.id,
            name: pkg.name,
            nights: pkg.nights,
            includes: pkg.includes || [],
          };

          return updated;
        });

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
    if (hasDraft || mode === "package" || mode === "room-select") return;

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
  }, [hasDraft, mode, searchParams]);

  const activeSteps = getActiveSteps(mode, packageData);
  const stepIndex = activeSteps.findIndex((s) => s.key === currentStep);
  const progress = stepIndex >= 0 ? ((stepIndex + 1) / activeSteps.length) * 100 : 0;

  const nights = differenceInDays(bookingData.checkOut, bookingData.checkIn);

  const summary = useMemo(() => {
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
      serializedDraft
    );
  }, [bookingData, currentStep, queryClient, mode, packageId, roomId, roomName]);

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
