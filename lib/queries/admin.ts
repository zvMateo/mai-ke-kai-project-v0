"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "./keys";
import type { Service, User } from "@/types/database";
import {
  fetchRooms,
  fetchServices,
  fetchPackages,
  fetchRewards,
  fetchUsers,
  fetchAdminDashboardStats,
  type BasicFilter,
  type RoomWithDetails,
  type AdminDashboardStats,
} from "./admin-fetchers";

async function fetchRoomsClient(filters?: BasicFilter) {
  const supabase = createClient();
  return fetchRooms(supabase, filters);
}

async function fetchServicesClient(filters?: {
  category?: Service["category"];
  isActive?: boolean;
}) {
  const supabase = createClient();
  return fetchServices(supabase, filters);
}

async function fetchPackagesClient(filters?: BasicFilter) {
  const supabase = createClient();
  return fetchPackages(supabase, filters);
}

async function fetchRewardsClient(filters?: BasicFilter) {
  const supabase = createClient();
  return fetchRewards(supabase, filters);
}

async function fetchUsersClient(filters?: { role?: User["role"] }) {
  const supabase = createClient();
  return fetchUsers(supabase, filters);
}

async function fetchAdminDashboardStatsClient() {
  const supabase = createClient();
  return fetchAdminDashboardStats(supabase);
}

export function useRoomsList(filters?: BasicFilter) {
  return useQuery({
    queryKey: queryKeys.rooms.list(filters),
    queryFn: () => fetchRoomsClient(filters),
    staleTime: 1000 * 60 * 30,
    placeholderData: (previousData) => previousData,
  });
}

export function useServicesList(filters?: {
  category?: Service["category"];
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.services.list(filters),
    queryFn: () => fetchServicesClient(filters),
    staleTime: 1000 * 60 * 30,
    placeholderData: (previousData) => previousData,
  });
}

export function usePackagesList(filters?: BasicFilter) {
  return useQuery({
    queryKey: queryKeys.packages.list(filters),
    queryFn: () => fetchPackagesClient(filters),
    staleTime: 1000 * 60 * 30,
    placeholderData: (previousData) => previousData,
  });
}

export function useRewardsList(filters?: BasicFilter) {
  return useQuery({
    queryKey: queryKeys.loyalty.rewards(),
    queryFn: () => fetchRewardsClient(filters),
    staleTime: 1000 * 60 * 30,
    placeholderData: (previousData) => previousData,
  });
}

export function useUsersList(filters?: { role?: User["role"] }) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => fetchUsersClient(filters),
    staleTime: 1000 * 60 * 30,
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: () => fetchAdminDashboardStatsClient(),
    staleTime: 1000 * 60 * 30,
    refetchInterval: 1000 * 60 * 15,
    placeholderData: (previousData) => previousData,
  });
}

export type { RoomWithDetails };
export type { AdminDashboardStats };
