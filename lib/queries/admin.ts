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
  fetchOccupancyHistory,
  fetchCurrentRoomOccupancy,
  fetchRecentBookings,
  fetchCalendarBookings,
  fetchCalendarRooms,
  fetchRevenueHistory,
  fetchMonthlyOccupancy,
  fetchServicesSales,
  fetchChannelData,
  fetchDashboardGrowth,
  fetchTotalBeds,
  type BasicFilter,
  type RoomWithDetails,
  type AdminDashboardStats,
  type OccupancyDataPoint,
  type RoomOccupancyData,
  type RecentBooking,
  type CalendarBooking,
  type RevenueDataPoint,
  type MonthlyOccupancy,
  type ServiceSalesData,
  type ChannelData,
  type DashboardGrowth,
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
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });
}

// ============================================================================
// NEW HOOKS FOR DASHBOARD CHARTS AND REPORTS
// ============================================================================

export function useOccupancyHistory(days: number = 14) {
  return useQuery({
    queryKey: queryKeys.admin.occupancyHistory(days),
    queryFn: async () => {
      const supabase = createClient();
      return fetchOccupancyHistory(supabase, days);
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });
}

export function useCurrentRoomOccupancy() {
  return useQuery({
    queryKey: queryKeys.admin.roomOccupancy(),
    queryFn: async () => {
      const supabase = createClient();
      return fetchCurrentRoomOccupancy(supabase);
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });
}

export function useRecentBookings(limit: number = 5) {
  return useQuery({
    queryKey: queryKeys.admin.recentBookings(limit),
    queryFn: async () => {
      const supabase = createClient();
      return fetchRecentBookings(supabase, limit);
    },
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
  });
}

export function useCalendarBookings(startDate: string, endDate: string) {
  return useQuery({
    queryKey: queryKeys.admin.calendarBookings(startDate, endDate),
    queryFn: async () => {
      const supabase = createClient();
      return fetchCalendarBookings(supabase, startDate, endDate);
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!startDate && !!endDate,
  });
}

export function useCalendarRooms() {
  return useQuery({
    queryKey: queryKeys.admin.calendarRooms(),
    queryFn: async () => {
      const supabase = createClient();
      return fetchCalendarRooms(supabase);
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useRevenueHistory() {
  return useQuery({
    queryKey: queryKeys.admin.revenueHistory(),
    queryFn: async () => {
      const supabase = createClient();
      return fetchRevenueHistory(supabase);
    },
    staleTime: 1000 * 60 * 15,
  });
}

export function useMonthlyOccupancy() {
  return useQuery({
    queryKey: queryKeys.admin.monthlyOccupancy(),
    queryFn: async () => {
      const supabase = createClient();
      return fetchMonthlyOccupancy(supabase);
    },
    staleTime: 1000 * 60 * 15,
  });
}

export function useServicesSales() {
  return useQuery({
    queryKey: queryKeys.admin.servicesSales(),
    queryFn: async () => {
      const supabase = createClient();
      return fetchServicesSales(supabase);
    },
    staleTime: 1000 * 60 * 15,
  });
}

export function useChannelData() {
  return useQuery({
    queryKey: queryKeys.admin.channelData(),
    queryFn: async () => {
      const supabase = createClient();
      return fetchChannelData(supabase);
    },
    staleTime: 1000 * 60 * 15,
  });
}

export function useDashboardGrowth() {
  return useQuery({
    queryKey: queryKeys.admin.growth(),
    queryFn: async () => {
      const supabase = createClient();
      return fetchDashboardGrowth(supabase);
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });
}

export function useTotalBeds() {
  return useQuery({
    queryKey: queryKeys.admin.totalBeds(),
    queryFn: async () => {
      const supabase = createClient();
      return fetchTotalBeds(supabase);
    },
    staleTime: 1000 * 60 * 30,
  });
}

export type { RoomWithDetails };
export type { AdminDashboardStats };
export type { OccupancyDataPoint };
export type { RoomOccupancyData };
export type { RecentBooking };
export type { CalendarBooking };
export type { RevenueDataPoint };
export type { MonthlyOccupancy };
export type { ServiceSalesData };
export type { ChannelData };
export type { DashboardGrowth };
