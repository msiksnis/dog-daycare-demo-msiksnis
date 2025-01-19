import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

function parseDateStringToMidnight(dateString: string): Date {
  const date = new Date(dateString);
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
}

type Params = Promise<{ canineId: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  const { canineId } = await params;

  try {
    const bookings = await prismadb.booking.findMany({
      where: { canineId: canineId },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.log(["OWNER_GET"], error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Params }) {
  const { canineId } = await params;

  try {
    const body = await req.json();
    const { dates } = body;

    if (!canineId) {
      return new NextResponse("Canine is required", { status: 400 });
    }

    if (!dates || !Array.isArray(dates)) {
      return new NextResponse("Dates are required", { status: 400 });
    }

    const canine = await prismadb.canine.findUnique({
      where: { id: canineId },
      select: { ownerId: true },
    });

    if (!canine) {
      return new NextResponse("Canine not found", { status: 404 });
    }

    const bookingPromises = dates.map(
      ({ date, isHalfDay }: { date: string; isHalfDay: boolean }) =>
        prismadb.booking
          .create({
            data: {
              ownerId: canine.ownerId,
              canineId,
              date: parseDateStringToMidnight(date),
              isHalfDay,
            },
            include: {
              canine: true,
            },
          })
          .then((booking) => ({ success: true, booking }))
          .catch((error) => {
            console.error("Booking creation failed:", {
              date,
              error: error.message,
            });
            return { success: false, error: error.message };
          }),
    );

    const bookingResults = await Promise.all(bookingPromises);

    const successfulBookings = bookingResults.filter(
      (result) => result.success,
    );
    const failedBookings = bookingResults.filter((result) => !result.success);

    return NextResponse.json({ successfulBookings, failedBookings });
  } catch (error) {
    console.error("[BOOKINGS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
