import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

type Params = Promise<{ bookingId: string }>;

export async function DELETE(req: Request, { params }: { params: Params }) {
  const { bookingId } = await params;

  try {
    if (!bookingId) {
      return new NextResponse("Booking ID is required", { status: 400 });
    }

    const booking = await prismadb.booking.deleteMany({
      where: {
        id: bookingId,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.log(["BOOKING_DELETE"], error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
