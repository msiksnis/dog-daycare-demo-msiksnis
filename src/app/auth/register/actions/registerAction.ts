"use server";
import bcrypt from "bcrypt";

import { RegisterInput, registerSchema } from "../registerSchema";
import prismadb from "@/lib/prismadb";
import { getUserByEmail } from "@/app/auth/data/user";
import { generateVerificationToken } from "@/app/auth/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export async function registerAction(data: RegisterInput) {
  const validatedData = registerSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: "Invalid credentials. Please try again." };
  }

  const { name, email, password } = validatedData.data;

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "User with this email already exists." };
  }

  await prismadb.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: "Confirmation email sent!" };
}
