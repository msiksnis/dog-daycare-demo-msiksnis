"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginInput, loginSchema } from "../loginSchema";
import { getUserByEmail } from "@/app/auth/data/user";
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from "@/app/auth/lib/tokens";
import { sendTwoFactorEmail, sendVerificationEmail } from "@/lib/mail";
import { getTwoFactorTokenByEmail } from "../../data/twoFactorToken";
import prismadb from "@/lib/prismadb";
import { getTwoFactorConfirmationByUserId } from "../../data/twoFactorConfirmation";

export async function loginAction(
  data: LoginInput,
  callbackUrl?: string | null,
) {
  const validatedData = loginSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: "Invalid credentials. Please try again." };
  }

  const { email, password, code } = validatedData.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Account with this email does not exist." };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email,
    );

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    );

    return { success: "Confirmation email sent!" };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) {
        return { error: "Invalid code." };
      }

      if (twoFactorToken.token !== code) {
        return { error: "Invalid code." };
      }

      const hasExpired = new Date() > new Date(twoFactorToken.expiresAt);

      if (hasExpired) {
        return { error: "Code has expired." };
      }

      await prismadb.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id,
      );

      if (existingConfirmation) {
        await prismadb.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await prismadb.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin": {
          return { error: "Invalid credentials. Please try again." };
        }
        default: {
          return { error: "Something went wrong. Please try again." };
        }
      }
    }

    throw error;
  }
}
