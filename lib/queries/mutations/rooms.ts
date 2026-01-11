"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/lib/queries/keys";
import { createRoom, updateRoom, deleteRoom } from "@/lib/actions/rooms";
import type { RoomType, SellUnit } from "@/types/database";

type CreateRoomInput = {
  name: string;
  type: RoomType;
  capacity: number;
  sell_unit: SellUnit;
  description?: string;
  amenities?: string[];
  main_image?: string;
  images?: string[];
};

type UpdateRoomInput = Partial<CreateRoomInput> & { id: string };

export function useCreateRoom() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateRoomInput) => createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
      router.push("/admin/rooms");
      router.refresh();
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateRoomInput) => updateRoom(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.rooms.detail(variables.id),
      });
      router.push("/admin/rooms");
      router.refresh();
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (roomId: string) => deleteRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
      router.refresh();
    },
  });
}
