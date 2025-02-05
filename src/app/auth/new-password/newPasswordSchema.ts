import * as z from "zod";

export const newPasswordSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
