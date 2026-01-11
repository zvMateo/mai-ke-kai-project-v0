"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { createClient } from "@/lib/supabase/client";
import type { Service } from "@/types/database";
import type { RoomWithPricing } from "./booking-fetchers";
import {
  fetchServicesServer,
  fetchRoomsWithPricingServer,
} from "./booking-fetchers";

async function fetchRoomsWithPricing(
  checkInDate: Date
): Promise<RoomWithPricing[]> {
  const supabase = createClient();
  return fetchRoomsWithPricingServer(supabase, checkInDate);
}

async function fetchServices(category?: string): Promise<Service[]> {
  const supabase = createClient();
  return fetchServicesServer(supabase, category);
}

export function useRoomsWithPricing(checkIn: Date | null) {
  const checkInKey = checkIn?.toISOString().split("T")[0] || "";

  return useQuery({
    queryKey: queryKeys.rooms.withPricing(checkInKey),
    queryFn: () => fetchRoomsWithPricing(checkIn!),
    enabled: !!checkIn,
    staleTime: 1000 * 60 * 30,
  });
}

export function useServices(category?: string) {
  return useQuery({
    queryKey: category
      ? queryKeys.services.byCategory(category)
      : queryKeys.services.lists(),
    queryFn: () => fetchServices(category),
    staleTime: 1000 * 60 * 30,
    placeholderData: (previousData) => previousData,
  });
}

export type { RoomWithPricing };
