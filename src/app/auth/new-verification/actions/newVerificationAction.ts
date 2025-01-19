"use server";

import { getUserByEmail } from "@/app/auth/data/user";
import { getVerificationTokenByToken } from "@/app/auth/data/verificationToken";
import prismadb from "@/lib/prismadb";

export const newVerificationAction = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token missing or expired." };
  }

  const hasExpired = new Date(existingToken.expiresAt) < new Date();

  if (hasExpired) {
    return { error: "Verification token has expired." };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "User with this email does not exist." };
  }

  await prismadb.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      emailVerified: new Date(),
      email: existingToken.email,
    },
  });

  await prismadb.verificationToken.delete({
    where: {
      id: existingToken.id,
    },
  });

  return { success: "Email confirmed. You can log in now!" };
};
