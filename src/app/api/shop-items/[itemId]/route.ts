import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { handleApiError } from "@/lib/utils";
import { currentUserServer } from "@/lib/serverAuth";

type Params = Promise<{ itemId: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  const user = await currentUserServer();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { itemId } = await params;

  try {
    const item = await prisma.shopItem.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!item) {
      return NextResponse.json(
        { message: "Shop item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    return handleApiError(error, "[SHOP_ITEM_BY_ID_GET]");
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const user = await currentUserServer();
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { itemId } = await params;

  console.log("itemId", itemId);

  try {
    await prisma.shopItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json(
      { message: "Shop item deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error, "[SHOP_ITEM_BY_ID_DELETE]");
  }
}
