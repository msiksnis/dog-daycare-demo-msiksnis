"use server";

import prismadb from "@/lib/prismadb";
import { currentUserServer } from "@/lib/serverAuth";
import { OwnerInput, ownerSchema } from "../ownerSchema";

export async function createOwnerAction(input: OwnerInput) {
  const user = await currentUserServer();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const validatedData = ownerSchema.parse(input);

    const newOwner = await prismadb.owner.create({
      data: validatedData,
    });

    return newOwner;
  } catch (error) {
    console.error("[CREATE_OWNER]", error);
    throw new Error("Failed to create owner");
  }
}
