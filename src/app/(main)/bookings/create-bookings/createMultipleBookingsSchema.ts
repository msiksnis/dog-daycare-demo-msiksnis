import * as z from "zod";

export const createMultipleBookingsSchema = z.object({
  dates: z.array(
    z.object({
      date: z.date(),
      isHalfDay: z.boolean(),
      isPrepaid: z.boolean(),
      price: z.number(),
    }),
  ),
  canineId: z.string(),
});

export type CreateMultipleBookingsInput = z.infer<
  typeof createMultipleBookingsSchema
>;
