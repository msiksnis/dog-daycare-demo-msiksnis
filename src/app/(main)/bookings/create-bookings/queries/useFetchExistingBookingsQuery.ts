import { useQuery } from "@tanstack/react-query";
import { fetchExistingBookingsAction } from "../actions/fetchExistingBookingsAction";

export const useExistingBookingsQuery = (canineId: string | undefined) => {
  return useQuery({
    queryKey: ["previousBookings", canineId],
    queryFn: () => fetchExistingBookingsAction(canineId!),
    enabled: Boolean(canineId),
  });
};
