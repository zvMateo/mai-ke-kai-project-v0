"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queries/keys"
import { createBookingWithCheckout } from "@/lib/actions/checkout"

export interface CreateBookingInput {
  checkIn: string
  checkOut: string
  guestsCount: number
  rooms: Array<{
    roomId: string
    bedId?: string
    pricePerNight: number
  }>
  services?: Array<{
    serviceId: string
    quantity: number
    priceAtBooking: number
    scheduledDate?: string
  }>
  guestInfo: {
    email: string
    fullName: string
    phone?: string
    nationality?: string
  }
}

interface CreateBookingResult {
  bookingId: string
  bookingReference: string
  totalAmount: number
}

async function createBooking(
  input: CreateBookingInput
): Promise<CreateBookingResult> {
  const result = await createBookingWithCheckout(input)
  return {
    bookingId: result.bookingId,
    bookingReference: result.bookingReference,
    totalAmount: result.totalAmount,
  }
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBooking,
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.bookingFlow.payment(),
      })
      const previousStatus = queryClient.getQueryData(
        queryKeys.bookingFlow.payment()
      )
      queryClient.setQueryData(queryKeys.bookingFlow.payment(), {
        status: "creating",
      })
      return { previousStatus }
    },
    onError: (_error: Error, _variables: CreateBookingInput, context: { previousStatus: unknown } | undefined) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(
          queryKeys.bookingFlow.payment(),
          context.previousStatus
        )
      } else {
        queryClient.setQueryData(queryKeys.bookingFlow.payment(), {
          status: "error",
          message: _error.message || "Error creating booking",
        })
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.bookingFlow.payment(), {
        status: "created",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookingFlow.payment(),
      })
    },
  })
}

// Keep backward compatibility - alias the old name
export const useCreatePayment = useCreateBooking
