import type { QueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/server";
import type { Service, User } from "@/types/database";
import {
  fetchRooms,
  fetchServices,
  fetchPackages,
  fetchRewards,
  fetchUsers,
  fetchAdminDashboardStats,
  type BasicFilter,
} from "./admin-fetchers";
import { queryKeys } from "./keys";

export async function prefetchRoomsList(
  queryClient: QueryClient,
  filters?: BasicFilter
) {
  const supabase = await createClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.rooms.list(filters),
    queryFn: () => fetchRooms(supabase, filters),
  });
}

export async function prefetchServicesList(
  queryClient: QueryClient,
  filters?: {
    category?: Service["category"];
    isActive?: boolean;
  }
) {
  const supabase = await createClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.services.list(filters),
    queryFn: () => fetchServices(supabase, filters),
  });
}

export async function prefetchPackagesList(
  queryClient: QueryClient,
  filters?: BasicFilter
) {
  const supabase = await createClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.packages.list(filters),
    queryFn: () => fetchPackages(supabase, filters),
  });
}

export async function prefetchRewardsList(
  queryClient: QueryClient,
  filters?: BasicFilter
) {
  const supabase = await createClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.loyalty.rewards(),
    queryFn: () => fetchRewards(supabase, filters),
  });
}

export async function prefetchUsersList(
  queryClient: QueryClient,
  filters?: { role?: User["role"] }
) {
  const supabase = await createClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => fetchUsers(supabase, filters),
  });
}

export async function prefetchAdminDashboard(queryClient: QueryClient) {
  const supabase = await createClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: () => fetchAdminDashboardStats(supabase),
  });
}
