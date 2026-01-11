"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries/keys";

export interface PaymentInput {
  bookingData: {
    checkIn: string;
    checkOut: string;
    guestsCount: number;
    rooms: Array<{
      roomId: string;
      bedId?: string;
      pricePerNight: number;
    }>;
    services?: Array<{
      serviceId: string;
      quantity: number;
      priceAtBooking: number;
      scheduledDate?: string;
    }>;
    guestInfo: {
      email: string;
      fullName: string;
      phone?: string;
      nationality?: string;
    };
  };
}

interface PaymentResult {
  url: string;
}

async function createTilopayPayment(
  input: PaymentInput
): Promise<PaymentResult> {
  const response = await fetch("/api/tilopay/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok || !data.url) {
    throw new Error(data.error || "No se recibió URL de pago");
  }

  return { url: data.url };
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTilopayPayment,
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.bookingFlow.payment(),
      });
      const previousStatus = queryClient.getQueryData(
        queryKeys.bookingFlow.payment()
      );
      queryClient.setQueryData(queryKeys.bookingFlow.payment(), {
        status: "processing",
      });
      return { previousStatus };
    },
    onError: (error, _variables, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(
          queryKeys.bookingFlow.payment(),
          context.previousStatus
        );
      } else {
        queryClient.setQueryData(queryKeys.bookingFlow.payment(), {
          status: "error",
          message:
            error instanceof Error ? error.message : "Error procesando pago",
        });
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.bookingFlow.payment(), {
        status: "redirecting",
      });
      window.location.href = data.url;
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookingFlow.payment(),
      });
    },
  });
}
