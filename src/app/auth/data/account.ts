import prismadb from "@/lib/prismadb";

export async function getAccountByUserId(userId: string) {
  try {
    const account = await prismadb.account.findFirst({
      where: {
        userId: userId,
      },
    });

    return account;
  } catch (error) {
    console.error(error);
    return null;
  }
}
