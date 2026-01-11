import type { QueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import { queryKeys } from "./keys";
import {
  fetchUserProfile,
  fetchUpcomingBookings,
  fetchUserBookings,
  fetchLoyaltySummary,
  fetchActiveRewards,
} from "./dashboard-fetchers";

export async function prefetchUserDashboard(
  queryClient: QueryClient,
  userId: string
) {
  const supabase = await createClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.users.profile(userId),
      queryFn: () => fetchUserProfile(supabase, userId),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.bookings.userUpcoming(userId),
      queryFn: () => fetchUpcomingBookings(supabase, userId),
    }),
  ]);
}

export async function prefetchUserBookings(
  queryClient: QueryClient,
  userId: string
) {
  const supabase = await createClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.bookings.history(userId),
    queryFn: () => fetchUserBookings(supabase, userId),
  });
}

export async function prefetchUserLoyalty(
  queryClient: QueryClient,
  userId: string
) {
  const supabase = await createClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.loyalty.summary(userId),
      queryFn: () => fetchLoyaltySummary(supabase, userId),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.loyalty.rewards(),
      queryFn: () => fetchActiveRewards(supabase),
    }),
  ]);
}
