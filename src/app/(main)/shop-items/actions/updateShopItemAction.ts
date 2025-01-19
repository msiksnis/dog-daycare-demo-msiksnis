"use server";

import prismadb from "@/lib/prismadb";
import { currentUserServer } from "@/lib/serverAuth";
import { ShopItemInput, shopItemSchema } from "../shopItemSchema";

export async function updateShopItemAction(
  itemId: string,
  input: ShopItemInput,
) {
  const user = await currentUserServer();
  const userId = user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const validatedData = shopItemSchema.parse(input);

    const priceInCents = Math.round(parseFloat(validatedData.price));

    const updatedShopItem = await prismadb.shopItem.update({
      where: { id: itemId },
      data: {
        ...validatedData,
        price: priceInCents,
      },
    });

    return updatedShopItem;
  } catch (error) {
    console.error("[UPDATE_SHOP_ITEM]", error);
    throw new Error("Failed to update shop item");
  }
}
