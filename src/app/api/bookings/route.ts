import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { formatDateToISO } from "@/lib/dateUtils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      ownerId,
      canineId,
      date,
      isHalfDay,
      overnightStay,
      previousBookingDate,
    } = body;

    if (!ownerId) {
      return new NextResponse("Owner is required", { status: 400 });
    }

    if (!canineId) {
      return new NextResponse("Canine is required", { status: 400 });
    }

    if (!date) {
      return new NextResponse("Date is required", { status: 400 });
    }

    const bookingDate = new Date(date);
    const previousDate = previousBookingDate
      ? new Date(previousBookingDate)
      : null;

    const booking = await prismadb.booking.create({
      data: {
        ownerId,
        canineId,
        date: bookingDate,
        isHalfDay,
        overnightStay,
        previousBookingDate: previousDate,
      },
      include: {
        canine: true,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("[BOOKINGS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

type Params = Promise<{ date: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  const { date } = await params;

  try {
    const dateParam = new Date(date);
    const formattedDate = formatDateToISO(dateParam);

    if (!formattedDate || Array.isArray(formattedDate)) {
      return new NextResponse("Date query parameter is required", {
        status: 400,
      });
    }

    const bookingsForDate = await prismadb.booking.findMany({
      where: {
        date: formattedDate,
      },
      include: {
        canine: true,
      },
    });

    console.log("GET-Bookings Received request:", req.url);
    return NextResponse.json(bookingsForDate);
  } catch (error) {
    console.error("[BOOKINGS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
