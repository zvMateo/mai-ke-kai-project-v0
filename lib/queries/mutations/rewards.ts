"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/lib/queries/keys";
import {
  createReward,
  updateReward,
  deleteReward,
} from "@/lib/actions/loyalty";
import type { LoyaltyReward } from "@/lib/actions/loyalty";

type CreateRewardInput = Omit<
  LoyaltyReward,
  "id" | "times_redeemed" | "created_at" | "updated_at"
>;
type UpdateRewardInput = Partial<LoyaltyReward> & { id: string };

export function useCreateReward() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateRewardInput) => createReward(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loyalty.all });
      router.push("/admin/loyalty");
      router.refresh();
    },
  });
}

export function useUpdateReward() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateRewardInput) => updateReward(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loyalty.all });
      router.push("/admin/loyalty");
      router.refresh();
    },
  });
}

export function useDeleteReward() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (rewardId: string) => deleteReward(rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loyalty.all });
      router.refresh();
    },
  });
}
