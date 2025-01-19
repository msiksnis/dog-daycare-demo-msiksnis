import kyInstance from "@/lib/ky";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { NotificationsPage } from "./types";

/**
 * Custom hook to manage notifications and role requests.
 * Provides functions to mark notifications as read, accept, or reject role requests.
 *
 * @returns {object} - Contains infinite query data and mutation functions.
 */
export function useNotifications(currentUserId: string) {
  const queryClient = useQueryClient();

  const infiniteQuery = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/notifications",
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<NotificationsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    select: (data) => ({
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        notifications: page.notifications.map((notification) => ({
          ...notification,
          NotificationReadState: notification.NotificationReadState.filter(
            (state) => state.userId === currentUserId,
          ),
        })),
      })),
    }),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      kyInstance.patch(`/api/notifications/${notificationId}/mark-as-read`),
    onSuccess: (data, notificationId) => {
      queryClient.setQueryData(["notifications"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            notifications: page.notifications.map((notification: any) =>
              notification.id === notificationId
                ? {
                    ...notification,
                    NotificationReadState:
                      notification.NotificationReadState.map((state: any) => ({
                        ...state,
                        read: true,
                      })),
                  }
                : notification,
            ),
          })),
        };
      });

      queryClient.setQueryData(
        ["unread-notification-count"],
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            unreadCount: Math.max(0, oldData.unreadCount - 1),
          };
        },
      );
    },
    onError(error) {
      console.error("Failed to mark notification as read", error);
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (roleRequestId: string) =>
      kyInstance.patch(`/api/roles/${roleRequestId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      console.error("Failed to accept the role request", error);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (roleRequestId: string) =>
      kyInstance.patch(`/api/roles/${roleRequestId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      console.error("Failed to reject the role request", error);
    },
  });

  return {
    ...infiniteQuery,
    acceptMutation: acceptMutation.mutate,
    rejectMutation: rejectMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isMarkingAsRead: markAsReadMutation.isPending,
  };
}
