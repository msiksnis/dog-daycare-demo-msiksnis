import * as z from "zod";

export const resetPasswordSchema = z.object({
  email: z
    .string({
      invalid_type_error: "Please enter email address to reset password",
    })
    .email({
      message: "Email is required",
    }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
