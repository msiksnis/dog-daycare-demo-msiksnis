"use server";

import prismadb from "@/lib/prismadb";
import { currentUserServer } from "@/lib/serverAuth";
import { CheckInStatus } from "@prisma/client";

interface UpdateBookingStatusInput {
  bookingId: string;
  status: CheckInStatus;
}

export async function updateBookingStatusAction({
  bookingId,
  status,
}: UpdateBookingStatusInput) {
  const user = await currentUserServer();
  const userId = user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const booking = await prismadb.booking.update({
    where: { id: bookingId },
    data: { checkInStatus: status },
  });

  return booking;
}
