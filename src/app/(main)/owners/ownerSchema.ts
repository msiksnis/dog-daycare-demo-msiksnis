import * as z from "zod";

export const ownerSchema = z.object({
  name: z.string().trim().min(1, {
    message: "Name is required",
  }),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Invalid email format",
    }),
  mobile: z.string().optional(),
  workPhone: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export type OwnerInput = z.infer<typeof ownerSchema>;
