import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { handleApiError } from "@/lib/utils";
import { currentUserServer } from "@/lib/serverAuth";
import { shopItemSchema } from "@/app/(main)/shop-items/shopItemSchema";

export async function POST(request: Request) {
  try {
    const user = await currentUserServer();
    const userId = user?.id;

    const body = await request.json();
    const parsedBody = shopItemSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { errors: parsedBody.error.errors },
        { status: 400 },
      );
    }

    const { title, description, stock, price } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    if (!title || !price) {
      return NextResponse.json(
        { message: "Title and price are required." },
        { status: 400 },
      );
    }

    const newItem = await prisma.shopItem.create({
      data: {
        title,
        description,
        stock,
        price,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return handleApiError(error, "[SHOP_ITEMS_POST]");
  }
}

export async function GET() {
  try {
    const items = await prisma.shopItem.findMany();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    return handleApiError(error, "[SHOP_ITEMS_GET]");
  }
}
