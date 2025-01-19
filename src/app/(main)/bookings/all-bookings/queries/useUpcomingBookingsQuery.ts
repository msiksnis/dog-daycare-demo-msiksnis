import { useQuery, QueryKey } from "@tanstack/react-query";
import { fetchUpcomingBookingAction } from "../actions/fetchUpcomingBookingsAction";
import { BookingWithDetails } from "../types";

interface UpcomingBookingsResponse {
  [key: string]: Date | null;
}

export function useUpcomingBookingsQuery(
  bookings: BookingWithDetails[],
  queryKey: QueryKey,
) {
  return useQuery<UpcomingBookingsResponse>({
    queryKey,
    queryFn: async () => {
      const newUpcomingBookingDates: { [key: string]: Date | null } = {};

      await Promise.all(
        bookings.map(async (booking) => {
          const upcomingBooking = await fetchUpcomingBookingAction(
            booking.canineId,
          );
          newUpcomingBookingDates[booking.canineId] = upcomingBooking
            ? new Date(upcomingBooking.date)
            : null;
        }),
      );

      return newUpcomingBookingDates;
    },
    enabled: bookings.length > 0, // Only run the query if there are bookings
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
