"use server";

import prismadb from "@/lib/prismadb";
import { ShopItemInput } from "../shopItemSchema";
import { currentUserServer } from "@/lib/serverAuth";

export async function createShopItemAction({
  title,
  description,
  price,
  stock,
}: ShopItemInput) {
  const user = await currentUserServer();
  const userId = user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const priceInCents = Math.round(Number(price));
    if (isNaN(priceInCents)) {
      throw new Error("Invalid price format");
    }

    const newShopItem = await prismadb.shopItem.create({
      data: {
        title: title,
        description: description || null,
        price: priceInCents,
        stock: stock ?? null,
      },
    });

    return newShopItem;
  } catch (error) {
    console.error("[CREATE_SHOP_ITEM]", error);
    throw new Error("Failed to create shop item");
  }
}
