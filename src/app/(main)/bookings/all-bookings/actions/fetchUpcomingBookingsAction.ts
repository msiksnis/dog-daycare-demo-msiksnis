// fetch-upcoming-bookings-action.ts
import kyInstance from "@/lib/ky";

// Fetch upcoming bookings for a specific canine
export async function fetchUpcomingBookingAction(canineId: string) {
  return await kyInstance
    .get(`/api/bookings/upcoming-bookings/${canineId}`)
    .json<{ date: string }>();
}
