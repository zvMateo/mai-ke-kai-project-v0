"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { createClient } from "@/lib/supabase/client";
import {
  fetchUserProfile,
  fetchUpcomingBookings,
  fetchUserBookings,
  fetchLoyaltySummary,
  fetchActiveRewards,
  type UserProfile,
  type UpcomingBooking,
  type UserBooking,
  type LoyaltySummary,
  type ActiveReward,
} from "./dashboard-fetchers";

async function fetchUserProfileClient(userId: string) {
  const supabase = createClient();
  return fetchUserProfile(supabase, userId);
}

async function fetchUpcomingBookingsClient(userId: string) {
  const supabase = createClient();
  return fetchUpcomingBookings(supabase, userId);
}

async function fetchUserBookingsClient(userId: string) {
  const supabase = createClient();
  return fetchUserBookings(supabase, userId);
}

async function fetchLoyaltySummaryClient(userId: string) {
  const supabase = createClient();
  return fetchLoyaltySummary(supabase, userId);
}

async function fetchActiveRewardsClient() {
  const supabase = createClient();
  return fetchActiveRewards(supabase);
}

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.profile(userId),
    queryFn: () => fetchUserProfileClient(userId!),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 15,
    placeholderData: (previousData) => previousData,
  });
}

export function useUpcomingBookings(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.bookings.userUpcoming(userId),
    queryFn: () => fetchUpcomingBookingsClient(userId!),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 15,
    placeholderData: (previousData) => previousData,
  });
}

export function useUserBookings(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.bookings.history(userId),
    queryFn: () => fetchUserBookingsClient(userId!),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 15,
    placeholderData: (previousData) => previousData,
  });
}

export function useLoyaltySummary(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.loyalty.summary(userId),
    queryFn: () => fetchLoyaltySummaryClient(userId!),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 15,
    placeholderData: (previousData) => previousData,
  });
}

export function useActiveRewards() {
  return useQuery({
    queryKey: queryKeys.loyalty.rewards(),
    queryFn: () => fetchActiveRewardsClient(),
    staleTime: 1000 * 60 * 30,
    placeholderData: (previousData) => previousData,
  });
}

export type {
  UserProfile,
  UpcomingBooking,
  UserBooking,
  LoyaltySummary,
  ActiveReward,
};
