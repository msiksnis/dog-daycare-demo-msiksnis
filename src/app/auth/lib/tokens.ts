import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

import prismadb from "../../../lib/prismadb";
import { getVerificationTokenByEmail } from "@/app/auth/data/verificationToken";
import { getPasswordResetTokenByEmail } from "@/app/auth/data/passwordResetToken";
import { getTwoFactorTokenByEmail } from "@/app/auth/data/twoFactorToken";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expiresAt = new Date(new Date().getTime() + 1000 * 60 * 15);

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await prismadb.verificationToken.delete({
      where: { id: existingToken.id },
    });
  }

  const verificationToken = await prismadb.verificationToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  return verificationToken;
};

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expiresAt = new Date(new Date().getTime() + 1000 * 60 * 15);

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await prismadb.passwordResetToken.delete({
      where: { id: existingToken.id },
    });
  }

  const passwordResetToken = await prismadb.passwordResetToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  return passwordResetToken;
};

export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 999_999).toString();
  const expiresAt = new Date(new Date().getTime() + 1000 * 60 * 15);

  const existingToken = await getTwoFactorTokenByEmail(email);

  if (existingToken) {
    await prismadb.twoFactorToken.delete({
      where: { id: existingToken.id },
    });
  }

  const twoFactorToken = await prismadb.twoFactorToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  return twoFactorToken;
};
