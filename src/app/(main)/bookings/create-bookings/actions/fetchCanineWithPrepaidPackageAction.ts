"use server";

import prismadb from "@/lib/prismadb";

export async function fetchCanineWithPrepaidPackageAction(canineId: string) {
  try {
    const canine = await prismadb.canine.findUnique({
      where: { id: canineId },
      include: {
        prepaidPackagePrice: true,
      },
    });
    return canine;
  } catch (error) {
    console.error("Error fetching canine:", error);
    throw error;
  }
}
