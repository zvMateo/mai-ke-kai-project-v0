import type { QueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { queryKeys } from "./keys";
import {
  fetchRoomsWithPricingServer,
  fetchServicesServer,
} from "./booking-fetchers";

export async function prefetchBookingFlow(
  queryClient: QueryClient,
  checkInDate: Date
) {
  const supabase = await createClient();
  const checkInKey = checkInDate.toISOString().split("T")[0];

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.rooms.withPricing(checkInKey),
        queryFn: () => fetchRoomsWithPricingServer(supabase, checkInDate),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.services.lists(),
        queryFn: () => fetchServicesServer(supabase),
      }),
    ]);
  } catch (error) {
    console.error("Error prefetching booking flow:", error);
    // Don't throw, let the client fetch data if prefetch fails
  }
}
