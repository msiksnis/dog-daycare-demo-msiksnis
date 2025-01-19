import { Role } from "@prisma/client";
import * as z from "zod";

export const profileSchema = z
  .object({
    name: z.string().min(1, {
      message: "Name is required",
    }),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([Role.ADMIN, Role.USER, Role.DEMO]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string()),
    newPassword: z.optional(z.string().min(8)),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: "New password is required!",
      path: ["newPassword"],
    },
  )
  .refine(
    (data) => {
      if (!data.password && data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: "Password is required!",
      path: ["password"],
    },
  );

export type ProfileInput = z.infer<typeof profileSchema>;
