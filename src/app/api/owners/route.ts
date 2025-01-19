import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const owners = await prismadb.owner.findMany({
      include: {
        canines: true,
        bookings: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(owners);
  } catch (error) {
    console.error("[OWNERS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
