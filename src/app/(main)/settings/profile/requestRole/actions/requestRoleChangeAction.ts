"use server";

import prismadb from "@/lib/prismadb";
import { currentUserServer } from "@/lib/serverAuth";
import { omitUndefined } from "@/lib/utils";
import { NotificationType } from "@prisma/client";
import { RoleChangeInput, roleChangeSchema } from "../validationSchemas";

export async function requestRoleChangeAction(data: RoleChangeInput) {
  const user = await currentUserServer();

  if (!user) {
    throw new Error("Unauthorized: User not logged in.");
  }

  try {
    // Validate the role change input
    const validatedRoleData = roleChangeSchema.parse(data);

    // Create the RoleRequest record
    const roleRequest = await prismadb.roleRequest.create({
      data: {
        ...validatedRoleData,
        userId: user.id,
      },
    });

    // Create the notification
    const notification = await prismadb.notification.create({
      data: omitUndefined({
        type: NotificationType.ROLE_REQUEST,
        requestedById: user.id,
        requestId: roleRequest.id,
        title: `Role Change Request by ${user.name || "User"}`,
        message: `${user.name || "A user"} has requested a role change to ${validatedRoleData.requestedRole}.`,
        metadata: {
          reason: validatedRoleData.reason,
        },
      }),
    });

    // Query all admin users
    const adminUsers = await prismadb.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
      },
    });

    // Create entries in notification_read_states for each admin
    const notificationReadStates = adminUsers.map((admin) => ({
      notificationId: notification.id,
      userId: admin.id,
      read: false,
      readAt: null,
    }));

    await prismadb.notificationReadState.createMany({
      data: notificationReadStates,
    });

    return roleRequest;
  } catch (error) {
    console.error("[SUBMIT_ROLE_REQUEST] Error:", error);
    throw new Error("Failed to submit role request. Please try again later.");
  }
}
