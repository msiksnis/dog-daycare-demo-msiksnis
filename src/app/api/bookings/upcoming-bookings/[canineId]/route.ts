import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

type Params = Promise<{ canineId: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const { canineId } = await params;

    if (!canineId) {
      return new NextResponse("Canine ID is required", { status: 400 });
    }

    const upcomingBooking = await prismadb.booking.findFirst({
      where: {
        canineId,
        date: {
          gt: new Date(),
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(
      upcomingBooking ? { date: upcomingBooking.date } : null,
    );
  } catch (error) {
    console.error("[UPCOMING_BOOKING_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
