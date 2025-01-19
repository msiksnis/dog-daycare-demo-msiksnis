"use client";

import { FloatingLabel } from "@/components/FloatingInput";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";
import { NotificationWithTypedMetadata } from "./types";
import { useNotifications } from "./useNotifications";

interface NotificationContainerProps {
  notification: NotificationWithTypedMetadata;
  currentUserId: string;
  currentUserRole: string;
}

export default function NotificationContainer({
  notification,
  currentUserId,
  currentUserRole,
}: NotificationContainerProps) {
  const {
    markAsRead,
    acceptMutation,
    rejectMutation,
    isAccepting,
    isRejecting,
  } = useNotifications(currentUserId);

  const handleAccept = () => {
    if (notification.request?.id) {
      acceptMutation(notification.request.id);
    }
  };

  const handleReject = () => {
    if (notification.request?.id) {
      rejectMutation(notification.request.id);
    }
  };

  const isAdmin = currentUserRole?.toUpperCase() === "ADMIN";
  const isApproved = notification.request?.status === "ACCEPTED";
  const isRejected = notification.request?.status === "REJECTED";
  const isHandled = isApproved || isRejected;

  const isUnread = notification.NotificationReadState.some(
    (state) => !state.read,
  );

  function handleMarkAsRead(notificationId: string) {
    if (isUnread) {
      markAsRead(notificationId);
    }
  }

  return (
    <div
      onClick={() => handleMarkAsRead(notification.id)}
      className={cn(
        "relative mx-auto max-w-2xl rounded-lg border border-blue-chill-400 bg-card p-4 @container",
        {
          "cursor-pointer border-s-8": isUnread,
        },
      )}
    >
      {notification.type === "OTHER" && (
        <div className="flex flex-col justify-between">
          <div className="text-lg font-bold">{notification.title}</div>
          <div className="font-medium">{notification.message}</div>
        </div>
      )}
      {notification.type === "ROLE_REQUEST" && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between">
            <div className="text-lg font-bold">{notification.title}</div>
            <div className="font-medium">{notification.message}</div>
          </div>
          <div className="flex w-full flex-col items-start space-y-2 @md:flex-row @md:items-end @md:space-x-4 @md:space-y-0">
            {notification.metadata?.reason && (
              <div className="relative w-full">
                <div className="peer text-balance rounded-md border border-primary/40 bg-card px-1.5 py-1 pt-3 text-sm text-primary/90">
                  {notification.metadata.reason}
                </div>
                <FloatingLabel className="border-primary/40 bg-card text-primary/90">
                  Reason
                </FloatingLabel>
              </div>
            )}

            {!isHandled ? (
              <>
                {isAdmin ? (
                  <div className="ml-auto flex w-full justify-end space-x-4 pt-4">
                    <Button
                      variant={"outline"}
                      animation="scaleOnTap"
                      size={"sm"}
                      onClick={handleReject}
                      className="w-20 px-6"
                      disabled={isRejecting}
                    >
                      {isRejecting ? (
                        <Spinner className="text-primary" />
                      ) : (
                        "Reject"
                      )}
                    </Button>
                    <Button
                      type="button"
                      animation="scaleOnTap"
                      size={"sm"}
                      onClick={handleAccept}
                      className="w-20 px-6"
                      disabled={isAccepting}
                    >
                      {isAccepting ? <Spinner /> : "Accept"}
                    </Button>
                  </div>
                ) : (
                  <div className="w-1/3 rounded-md border border-primary/40 px-2 py-1.5 text-center font-semibold">
                    Pending
                  </div>
                )}
              </>
            ) : (
              <div className="flex w-full items-center rounded-md border border-primary/40 bg-card px-1.5 py-2 text-sm text-primary/90 @md:w-1/3">
                {isApproved && (
                  <>
                    <CheckCircle className="mr-2 text-emerald-500" />
                    <div className="">
                      Approved by: <br className="hidden sm:block" />
                      <span className="ml-1.5 font-bold @md:ml-0 sm:ml-0">
                        {notification.handledBy?.name}
                      </span>
                    </div>
                  </>
                )}
                {isRejected && (
                  <>
                    <XCircle className="mr-1.5 text-destructive" />
                    <div className="">
                      Rejected by: <br className="hidden sm:block" />
                      <span className="ml-1.5 font-bold @md:ml-0 sm:ml-0">
                        {notification.handledBy?.name}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
