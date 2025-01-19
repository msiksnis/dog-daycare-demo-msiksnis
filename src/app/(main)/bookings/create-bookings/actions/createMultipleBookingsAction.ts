"use server";

import prismadb from "@/lib/prismadb";
import { getErrorMessage } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { CreateMultipleBookingsInput } from "../createMultipleBookingsSchema";

export interface BookingResponse {
  error?: string;
  success?: boolean;
  successfulBookings?: any[];
  failedBookings?: any[];
}

export async function createMultipleBookingsAction(
  validatedData: CreateMultipleBookingsInput,
  ownerId: string,
  currentPrices: { category: string; amount: number }[],
): Promise<BookingResponse> {
  try {
    const bookingPromises = validatedData.dates.map(
      async ({ date, isHalfDay }) => {
        let price = 0;
        let isPrepaid = false;

        // Fetch the canine data with prepaid package details
        const canineWithPackage = await prismadb.canine.findUnique({
          where: { id: validatedData.canineId },
          include: { prepaidPackagePrice: true },
        });

        if (
          canineWithPackage?.prepaidPackagePrice &&
          canineWithPackage.numberOfPrepaidDays &&
          canineWithPackage.numberOfPrepaidDays > 0
        ) {
          // Logic to determine if prepaid package can be used
          const packageTypeMatches =
            (isHalfDay &&
              canineWithPackage.prepaidPackagePrice.type === "HALF_DAY") ||
            (!isHalfDay &&
              canineWithPackage.prepaidPackagePrice.type === "FULL_DAY");

          if (packageTypeMatches) {
            // If the prepaid package matches the booking type, set price to zero and mark as prepaid
            price = 0;
            isPrepaid = true;

            // Decrement the prepaid days
            await prismadb.canine.update({
              where: { id: validatedData.canineId },
              data: {
                numberOfPrepaidDays: canineWithPackage.numberOfPrepaidDays - 1,
              },
            });
          } else {
            // Otherwise, use the regular price
            price = determinePrice(isHalfDay, currentPrices);
          }
        } else {
          // If no prepaid package exists or it doesn't fit, use the regular price
          price = determinePrice(isHalfDay, currentPrices);
        }

        try {
          // Create the booking record
          const booking = await prismadb.booking.create({
            data: {
              ownerId,
              canineId: validatedData.canineId,
              date,
              isHalfDay,
            },
          });

          // Create corresponding BookingDetails for each booking
          await prismadb.bookingDetails.create({
            data: {
              bookingId: booking.id,
              canineId: validatedData.canineId,
              bookingPrice: price,
              isPrepaid,
              fullDay: !isHalfDay,
              packageDaysUsed: isPrepaid ? 1 : undefined,
              paymentMethod: "PAY_LATER", // Default to 'PAY_LATER'
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

// Helper function to determine regular price based on booking type
function determinePrice(
  isHalfDay: boolean,
  currentPrices: { category: string; amount: number }[],
): number {
  const priceCategory = isHalfDay ? "HALF_DAY" : "FULL_DAY";
  const price = currentPrices.find((price) => price.category === priceCategory);
  return price ? price.amount : 0;
}
