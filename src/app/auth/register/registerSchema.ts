import * as z from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  email: z
    .string({
      invalid_type_error: "Please enter a valid email address",
    })
    .email({
      message: "Email is required",
    }),
  password: z.string().min(8, {
    message: "Minimum 8 characters required",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
