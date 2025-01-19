import kyInstance from "@/lib/ky";
import { BookingWithDetails } from "../types";

export async function fetchBookingsAction(
  date: string,
  canineId?: string,
): Promise<BookingWithDetails[]> {
  const params: Record<string, string> = canineId ? { canineId } : {};

  return await kyInstance
    .get(`/api/bookings/${date}`, { searchParams: params })
    .json<BookingWithDetails[]>();
}
