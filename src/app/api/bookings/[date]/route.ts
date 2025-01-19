import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

type Params = Promise<{ date: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  const { date } = await params;

  try {
    if (!date || isNaN(new Date(date).getTime())) {
      return new NextResponse("Invalid or missing date parameter", {
        status: 400,
      });
    }

    const url = new URL(req.url);
    const canineId = url.searchParams.get("canineId");

    const parsedDate = new Date(date);
    const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

    const whereCondition: any = {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    if (canineId) {
      whereCondition.canineId = canineId;
    }

    const bookingsForDate = await prismadb.booking.findMany({
      where: whereCondition,
      include: {
        canine: {
          include: {
            owner: true,
          },
        },
      },
    });

    return NextResponse.json(bookingsForDate);
  } catch (error) {
    console.error("[BOOKINGS_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
