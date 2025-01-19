"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import prismadb from "@/lib/prismadb";
import { getErrorMessage } from "@/lib/utils";
import { currentUserServer } from "@/lib/serverAuth";

const createMultipleBookingsSchema = z.object({
  dates: z.array(
    z.object({
      date: z.date(),
      isHalfDay: z.boolean(),
    }),
  ),
  canineId: z.string(),
});

interface BookingResponse {
  error?: string;
  success?: boolean;
  successfulBookings?: any[];
  failedBookings?: any[];
}

export default async function createMultipleBookingsAction(
  prevState: any,
  formData: FormData,
): Promise<BookingResponse> {
  const dates = JSON.parse(formData.get("dates") as string).map(
    (d: { date: string; isHalfDay: boolean }) => ({
      date: new Date(d.date),
      isHalfDay: d.isHalfDay,
    }),
  );

  const validatedData = createMultipleBookingsSchema.safeParse({
    dates,
    canineId: formData.get("canineId") as string,
  });

  if (!validatedData.success) {
    return {
      error: validatedData.error.errors.map((e) => e.message).join(", "),
    };
  }

  const user = await currentUserServer();
  const userId = user?.id;

  if (!userId) {
    return { error: "You must be logged in." };
  }

  try {
    // Find ownerId associated with the canine
    const canine = await prismadb.canine.findUnique({
      where: { id: validatedData.data.canineId },
      select: { ownerId: true },
    });

    if (!canine) {
      return { error: "Canine not found" };
    }

    const bookingPromises = validatedData.data.dates.map(
      async ({ date, isHalfDay }) => {
        try {
          const booking = await prismadb.booking.create({
            data: {
              ownerId: canine.ownerId,
              canineId: validatedData.data.canineId,
              date,
              isHalfDay,
            },
            include: {
              canine: true,
            },
          });
          return { success: true, booking };
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          console.error("Booking creation failed:", {
            date,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },
    );

    const bookingResults = await Promise.all(bookingPromises);

    const successfulBookings = bookingResults.filter(
      (result) => result.success,
    );
    const failedBookings = bookingResults.filter((result) => !result.success);

    revalidatePath("/bookings/multiple-bookings/");
    return {
      success: true,
      successfulBookings,
      failedBookings,
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("[CREATE_BOOKINGS_ACTION]", errorMessage);
    return { error: errorMessage };
  }
}
