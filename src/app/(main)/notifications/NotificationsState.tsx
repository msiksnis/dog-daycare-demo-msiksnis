"use client";

import kyInstance from "@/lib/ky";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { NotificationCountInfo } from "./types";
import { usePathname } from "next/navigation";

interface NotificationsStateProps {
  initialNotificationState: NotificationCountInfo;
}

export default function NotificationsState({
  initialNotificationState,
}: NotificationsStateProps) {
  const pathname = usePathname();
  const isPathNotifications = pathname === "/notifications";

  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: () =>
      kyInstance
        .get("/api/notifications/unread-count")
        .json<NotificationCountInfo>(),
    initialData: initialNotificationState,
    refetchInterval: 60 * 1000,
  });

  return (
    <div
      className={cn(
        "size-3 rounded-full bg-transparent shadow-sm",
        {
          "bg-gradient-to-br z-20 from-purple-500 to-purple-600 ring-2 ring-sidebar":
            !!data.unreadCount,
        },
        {
          "ring-blue-chill-300": isPathNotifications,
        },
      )}
    />
  );
}
