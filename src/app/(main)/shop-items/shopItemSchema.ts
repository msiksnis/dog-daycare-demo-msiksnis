import * as z from "zod";

export const shopItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z
    .string()
    .min(1, "Price is required")
    .regex(/^\d*\.?\d*$/, "Price must be a valid number"),
  stock: z.number().nullable().optional(),
});

export type ShopItemInput = z.infer<typeof shopItemSchema>;
