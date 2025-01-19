// types.ts
import { Prisma, Notification } from "@prisma/client";

// Include definitions for Prisma Notification relations
export const notificationsInclude = {
  requestedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  request: {
    select: {
      id: true,
      requestedRole: true,
      status: true,
      reason: true,
    },
  },
  handledBy: {
    select: {
      id: true,
      name: true,
    },
  },
  canine: {
    select: {
      id: true,
      name: true,
      breed: true,
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  NotificationReadState: {
    select: {
      userId: true,
      read: true,
    },
  },
} satisfies Prisma.NotificationInclude;

// Notification type with relations included
export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude;
}>;

// Strongly typed metadata
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export type JsonArray = JsonValue[];

export interface RoleRequestMetadata {
  reason?: string;
}

export type NotificationWithTypedMetadata = NotificationData & {
  metadata: (JsonValue & Partial<RoleRequestMetadata>) | null;
};

export interface NotificationsPage {
  notifications: NotificationWithTypedMetadata[];
  nextCursor: string | null;
}

export interface NotificationCountInfo {
  unreadCount: number;
}
