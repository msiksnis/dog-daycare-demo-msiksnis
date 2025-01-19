import { NotificationType, Role } from "@prisma/client";
import * as z from "zod";

export const roleChangeSchema = z.object({
  reason: z.string().min(1, {
    message: "Explain why you need this role change",
  }),
  requestedRole: z.enum([Role.ADMIN, Role.USER, Role.DEMO]),
});

export type RoleChangeInput = z.infer<typeof roleChangeSchema>;

export const notificationSchema = z.object({
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1),
  requestedById: z.string().optional(),
  requestId: z.string().optional(),
  vaccineId: z.string().optional(),
  canineId: z.string().optional(),
  message: z.string().max(255).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type NotificationInput = z.infer<typeof notificationSchema>;
