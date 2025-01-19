import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteBookingAction } from "../actions/deleteBookingAction";
import useUpcomingBookingsStore from "@/hooks/useUpcomingBookingsStore";

export function useDeleteBookingMutation(queryKey: QueryKey) {
  const queryClient = useQueryClient();
  const { setMultipleUpcomingBookingDates, upcomingBookingDates } =
    useUpcomingBookingsStore();

  return useMutation({
    mutationFn: deleteBookingAction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Booking deleted successfully");

      // Remove the deleted booking's upcoming date from the store
      setMultipleUpcomingBookingDates({
        ...upcomingBookingDates,
        [variables]: null,
      });
    },
    onError: () => {
      toast.error("Failed to delete booking");
    },
  });
}
