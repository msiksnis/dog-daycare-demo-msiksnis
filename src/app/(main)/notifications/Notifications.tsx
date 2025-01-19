"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import MainLoader from "@/components/MainLoader";
import FormError from "@/components/FormError";
import NotificationContainer from "./NotificationContainer";
import { useNotifications } from "./useNotifications";

interface NotificationsProps {
  currentUserId: string;
  currentUserRole: string;
}

export default function Notifications({
  currentUserId,
  currentUserRole,
}: NotificationsProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useNotifications(currentUserId);

  const notifications = data?.pages.flatMap((page) => page.notifications) || [];

  if (status === "pending") return <MainLoader className="mt-24" />;
  if (status === "error")
    return (
      <FormError message="An error occurred while loading notifications." />
    );
  if (!notifications.length && !hasNextPage)
    return (
      <p className="text-center text-muted-foreground">
        No notifications to show.
      </p>
    );

  return (
    <InfiniteScrollContainer
      className="space-y-4"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {notifications.map((notification) => (
        <NotificationContainer
          key={notification.id}
          notification={notification}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      ))}
      {isFetchingNextPage && <MainLoader />}
    </InfiniteScrollContainer>
  );
}
