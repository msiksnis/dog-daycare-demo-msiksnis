"use server";

import { getUserByEmail, getUserById } from "@/app/auth/data/user";
import { generateVerificationToken } from "@/app/auth/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import prismadb from "@/lib/prismadb";
import { currentUserServer } from "@/lib/serverAuth";
import bcrypt from "bcryptjs";
import { ProfileInput } from "../profileSchema";

export async function profileAction(
  data: ProfileInput,
): Promise<{ success?: string; error?: string }> {
  const user = await currentUserServer();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const dbUser = await getUserById(user.id);

  if (!dbUser) {
    throw new Error("User not found");
  }

  if (user.isOAuth) {
    data.email = undefined;
    data.password = undefined;
    data.newPassword = undefined;
    data.isTwoFactorEnabled = undefined;
  }

  if (data.email && data.email !== dbUser.email) {
    const existingUser = await getUserByEmail(data.email);

    if (existingUser && existingUser.id !== user.id) {
      return {
        error: "Email already in use!",
      };
    }

    const verificationToken = await generateVerificationToken(data.email);

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );

    return {
      success: "Verification email sent!",
    };
  }

  if (data.password && data.newPassword && dbUser.password) {
    const passwordMatch = await bcrypt.compare(data.password, dbUser.password);

    if (!passwordMatch) {
      return {
        error: "Incorrect password!",
      };
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    data.password = hashedPassword;
    data.newPassword = undefined;
  }

  await prismadb.user.update({
    where: {
      id: user.id,
    },
    data: {
      ...data,
    },
  });

  return {
    success: "User updated",
  };
}
