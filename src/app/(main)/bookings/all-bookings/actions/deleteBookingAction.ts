"use server";

import prismadb from "@/lib/prismadb";
import { currentUserServer } from "@/lib/serverAuth";

export async function deleteBookingAction(bookingId: string) {
  const user = await currentUserServer();
  const userId = user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await prismadb.booking.delete({
    where: { id: bookingId },
  });
}
