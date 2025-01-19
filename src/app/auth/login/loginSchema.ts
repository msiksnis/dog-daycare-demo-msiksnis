import * as z from "zod";

export const loginSchema = z.object({
  email: z
    .string({
      invalid_type_error: "Please enter a valid email address",
    })
    .email({
      message: "Email is required",
    }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  code: z.optional(z.string()),
});

export type LoginInput = z.infer<typeof loginSchema>;
