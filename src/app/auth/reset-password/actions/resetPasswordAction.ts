"use server";

import { getUserByEmail } from "@/app/auth/data/user";
import {
  ResetPasswordInput,
  resetPasswordSchema,
} from "../resetPasswordSchema";
import { generatePasswordResetToken } from "@/app/auth/lib/tokens";
import { sendResetPasswordEmail } from "@/lib/mail";

export async function resetPasswordAction(data: ResetPasswordInput) {
  const validatedData = resetPasswordSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: "Invalid email. Please try again." };
  }

  const { email } = validatedData.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "Account with this email does not exist." };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendResetPasswordEmail(
    passwordResetToken.email,
    passwordResetToken.token,
  );

  return { success: "Reset link sent!" };
}
