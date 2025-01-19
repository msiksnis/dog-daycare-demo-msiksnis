import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateBookingStatusAction } from "../actions/updateBookingStatusAction";
import useLoadingStore from "@/hooks/useLoadingStore";
import { BookingWithDetails } from "../types";
import { CheckInStatus } from "@prisma/client";

interface UpdateStatusVariables {
  bookingId: string;
  status: CheckInStatus;
}

export function useUpdateStatusMutation(queryKey: QueryKey) {
  const queryClient = useQueryClient();
  const { setLoading } = useLoadingStore();

  return useMutation({
    mutationFn: updateBookingStatusAction,
    onMutate: async (variables: UpdateStatusVariables) => {
      await queryClient.cancelQueries({ queryKey });

      setLoading(variables.bookingId, true);

      const previousBookings =
        queryClient.getQueryData<BookingWithDetails[]>(queryKey);

      queryClient.setQueryData<BookingWithDetails[]>(queryKey, (old) =>
        old?.map((booking) =>
          booking.id === variables.bookingId
            ? { ...booking, checkInStatus: variables.status }
            : booking,
        ),
      );

      return { previousBookings };
    },
    onError: (err, variables: UpdateStatusVariables, context) => {
      if (context?.previousBookings) {
        queryClient.setQueryData(queryKey, context.previousBookings);
      }
      toast.error("Failed to update booking status");

      setLoading(variables.bookingId, false);
    },
    onSuccess: (_, variables: UpdateStatusVariables) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Booking status updated successfully");
      setLoading(variables.bookingId, false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
