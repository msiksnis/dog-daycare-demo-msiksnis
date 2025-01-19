import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

type Params = Promise<{ bookingId: string }>;

export async function PATCH(
  req: Request,
  { params }: { params: { params: Params } },
) {
  const { bookingId } = await params.params;

  try {
    const body = await req.json();

    const { isHalfDay, overnightStay, checkInStatus, previousBookingDate } =
      body;

    const booking = await prismadb.booking.updateMany({
      where: {
        id: bookingId,
      },
      data: {
        isHalfDay,
        overnightStay,
        checkInStatus,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.log(["BOOKING_PATCH"], error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
