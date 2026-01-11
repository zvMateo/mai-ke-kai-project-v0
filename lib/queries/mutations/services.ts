"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/lib/queries/keys";
import {
  createService,
  updateService,
  deleteService,
} from "@/lib/actions/services";
import type { Service, ServiceCategory } from "@/types/database";

interface CreateServiceInput {
  name: string;
  description: string | null;
  category: ServiceCategory;
  price: number;
  duration_hours: number | null;
  max_participants: number | null;
  image_url: string | null;
  is_active: boolean;
}

interface UpdateServiceInput extends Partial<CreateServiceInput> {
  id: string;
}

export function useCreateService() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateServiceInput) => createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      router.push("/admin/services");
      router.refresh();
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateServiceInput) =>
      updateService(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.services.detail(variables.id),
      });
      router.push("/admin/services");
      router.refresh();
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) => deleteService(serviceId),
    onMutate: async (serviceId: string) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.services.lists(),
      });

      const previousLists =
        queryClient.getQueriesData<Service[]>({
          queryKey: queryKeys.services.lists(),
        }) || [];

      previousLists.forEach(([key, services]) => {
        if (!services) return;
        queryClient.setQueryData(
          key,
          services.filter((service) => service.id !== serviceId)
        );
      });

      return { previousLists };
    },
    onError: (_err, _serviceId, context) => {
      context?.previousLists?.forEach(([key, services]) => {
        queryClient.setQueryData(key, services);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
}
