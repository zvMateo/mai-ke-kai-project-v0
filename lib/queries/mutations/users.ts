"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/lib/queries/keys";

interface CreateUserInput {
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  nationality?: string;
}

interface UpdateUserInput extends CreateUserInput {
  id: string;
}

async function createUserApi(data: CreateUserInput) {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al crear usuario");
  }

  return response.json();
}

async function updateUserApi(data: UpdateUserInput) {
  const response = await fetch("/api/admin/users", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al actualizar usuario");
  }

  return response.json();
}

async function deleteUserApi(userId: string) {
  const response = await fetch(`/api/admin/users?id=${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al eliminar usuario");
  }

  return response.json();
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      router.push("/admin/users");
      router.refresh();
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: updateUserApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      });
      router.push("/admin/users");
      router.refresh();
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      router.refresh();
    },
  });
}
