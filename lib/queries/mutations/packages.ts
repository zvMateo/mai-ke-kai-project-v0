"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/lib/queries/keys";
import {
  createPackage,
  updatePackage,
  deletePackage,
} from "@/lib/actions/packages";
import type { SurfPackage } from "@/types/database";

type CreatePackageInput = Omit<SurfPackage, "id" | "created_at" | "updated_at">;
type UpdatePackageInput = Partial<SurfPackage> & { id: string };

export function useCreatePackage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreatePackageInput) => createPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
      router.push("/admin/packages");
      router.refresh();
    },
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdatePackageInput) =>
      updatePackage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.packages.detail(variables.id),
      });
      router.push("/admin/packages");
      router.refresh();
    },
  });
}

export function useDeletePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId: string) => deletePackage(packageId),
    onMutate: async (packageId: string) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.packages.lists(),
      });

      const previousLists =
        queryClient.getQueriesData<SurfPackage[]>({
          queryKey: queryKeys.packages.lists(),
        }) || [];

      previousLists.forEach(([key, packages]) => {
        if (!packages) return;
        queryClient.setQueryData(
          key,
          packages.filter((pkg) => pkg.id !== packageId)
        );
      });

      return { previousLists };
    },
    onError: (_err, _packageId, context) => {
      context?.previousLists?.forEach(([key, packages]) => {
        queryClient.setQueryData(key, packages);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
    },
  });
}
