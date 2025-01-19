"use server";

import { z } from "zod";
import prismadb from "@/lib/prismadb";
import { ownerSchema } from "../ownerSchema";
import { currentUserServer } from "@/lib/serverAuth";

type OwnerInput = z.infer<typeof ownerSchema>;

export async function updateOwnerAction(ownerId: string, input: OwnerInput) {
  const user = await currentUserServer();
  const userId = user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const validatedData = ownerSchema.parse(input);

    const updatedOwner = await prismadb.owner.update({
      where: { id: ownerId },
      data: validatedData,
    });

    return updatedOwner;
  } catch (error) {
    console.error("[UPDATE_OWNER]", error);
    throw new Error("Failed to update owner");
  }
}
