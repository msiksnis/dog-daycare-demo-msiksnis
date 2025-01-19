import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

type Params = Promise<{ ownerId: string }>;

export async function DELETE(req: Request, { params }: { params: Params }) {
  const { ownerId } = await params;

  try {
    if (!ownerId) {
      return new NextResponse("Owner ID is required", { status: 400 });
    }

    const owner = await prismadb.owner.deleteMany({
      where: {
        id: ownerId,
      },
    });

    return NextResponse.json(owner);
  } catch (error) {
    console.log(["OWNER_DELETE"], error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
