"use server";

import prismadb from "@/lib/prismadb";

export async function fetchExistingBookingsAction(canineId: string) {
  try {
    const bookings = await prismadb.booking.findMany({
      where: { canineId },
    });
    return bookings.map((booking) => ({
      date: booking.date,
      isHalfDay: booking.isHalfDay,
    }));
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
}
