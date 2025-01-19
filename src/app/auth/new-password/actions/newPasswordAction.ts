"use server";
import bcrypt from "bcrypt";

import { getPasswordResetTokenByToken } from "@/app/auth/data/passwordResetToken";
import { NewPasswordInput, newPasswordSchema } from "../newPasswordSchema";
import { getUserByEmail } from "@/app/auth/data/user";
import prismadb from "@/lib/prismadb";

export async function newPasswordAction(
  data: NewPasswordInput,
  token?: string | null,
) {
  if (!token) {
    return { error: "Token not found. Please try again." };
  }

  const validatedData = newPasswordSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: "Invalid fields. Please try again." };
  }

  const { password } = validatedData.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Invalid token. Please try again." };
  }

  const hasExpired = new Date(existingToken.expiresAt) < new Date();

  if (hasExpired) {
    return { error: "Token has expired. Please try again." };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Account with this email does not exist." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prismadb.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  await prismadb.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Password updated!" };
}
