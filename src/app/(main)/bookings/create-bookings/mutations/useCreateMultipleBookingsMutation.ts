import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  BookingResponse,
  createMultipleBookingsAction,
} from "../actions/createMultipleBookingsAction";
import { CreateMultipleBookingsInput } from "../createMultipleBookingsSchema";

interface CreateMultipleBookingsProps {
  ownerId: string;
  validatedData: CreateMultipleBookingsInput;
  currentPrices: { category: string; amount: number }[];
}

export const useCreateMultipleBookingsMutation = (queryKey: QueryKey) => {
  const queryClient = useQueryClient();

  return useMutation<BookingResponse, Error, CreateMultipleBookingsProps>({
    mutationFn: async ({ ownerId, validatedData, currentPrices }) => {
      return await createMultipleBookingsAction(
        validatedData,
        ownerId,
        currentPrices,
      );
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey });
        toast.success("Bookings created successfully!");
      } else {
        toast.error(
          `Some bookings failed: ${data.failedBookings?.length || 0}`,
        );
      }
    },
    onError: (error) => {
      toast.error(`Error creating bookings: ${error}`);
    },
  });
};
