import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

type Params = Promise<{ canineId: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  const { canineId } = await params;

  try {
    if (!canineId) {
      return new NextResponse("Canine ID is required", { status: 400 });
    }

    const allBookings = await prismadb.booking.findMany({
      where: {
        canineId: canineId,
      },
      orderBy: {
        date: "asc",
      },
      select: {
        date: true,
      },
    });

    return NextResponse.json({
      allBookings: allBookings.map((booking) => booking.date),
    });
  } catch (error) {
    console.error("[LAST_BOOKING_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
