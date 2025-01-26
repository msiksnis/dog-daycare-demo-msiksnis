"use client";

import {
  CalendarDays,
  EllipsisVertical,
  ListCheckIcon,
  Trash2Icon,
  Undo2Icon,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import AlertModal from "@/components/modals/AlertModal";
import UndoModal from "@/components/modals/UndoModal";
import UpcomingBookingsModal from "@/components/modals/UpcomingBookingsModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useDrawerStore from "@/hooks/useDrawerStore";
import { cn } from "@/lib/utils";
import { Booking, CheckInStatus } from "@prisma/client";

interface BookingActionsProps {
  bookingId: string;
  booking: Booking;
  onDelete: (bookingId: string) => void;
  onStatusChange: (bookingId: string, newStatus: CheckInStatus) => void;
  canineName: string;
  ownerId: string;
}

export default function BookingActions({
  bookingId,
  booking,
  onDelete,
  onStatusChange,
  canineName,
  ownerId,
}: BookingActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [undoModalOpen, setUndoModalOpen] = useState(false);
  const [upcomingBookingsModalOpen, setUpcomingBookingsModalOpen] =
    useState(false);
  const [selectedCanineId, setSelectedCanineId] = useState<string>("");
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const { openDrawer } = useDrawerStore();

  const handleStatusChange = (newStatus: CheckInStatus) => {
    setIsLoading(true);
    try {
      onStatusChange(bookingId, newStatus);
    } finally {
      setIsLoading(false);
      setUndoModalOpen(false);
    }
  };

  const handleUndoAction = () => {
    let newStatus;
    switch (booking.checkInStatus) {
      case CheckInStatus.CHECKED_IN:
        newStatus = CheckInStatus.NOT_CHECKED_IN;
        break;
      case CheckInStatus.CHECKED_OUT:
        newStatus = CheckInStatus.CHECKED_IN;
        break;
      default:
        console.error("Cannot undo this action");
        return;
    }
    handleStatusChange(newStatus);
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="outline-none hover:bg-transparent"
          >
            <span className="sr-only">Open menu</span>
            <div className="flex items-center justify-center">
              <EllipsisVertical
                className={cn(
                  "ml-4 size-8 cursor-pointer px-1 transition-all duration-200",
                  dropdownOpen && "scale-150",
                )}
              />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Link
              href={`/owners/${ownerId}`}
              className="flex w-full items-center"
            >
              <User className="mr-2 h-4 w-4" />
              Owner
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn("cursor-pointer", {
              hidden: booking.checkInStatus === CheckInStatus.NOT_CHECKED_IN,
            })}
            onClick={() => setUndoModalOpen(true)}
          >
            <Undo2Icon className="mr-2 h-4 w-4" />
            Reverse Status
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={openDrawer}>
            <ListCheckIcon className="mr-2 size-[1.2rem]" />
            Summary
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              setSelectedCanineId(booking.canineId);
              setUpcomingBookingsModalOpen(true);
            }}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Upcoming Bookings
          </DropdownMenuItem>
          <DropdownMenuItem
            destructive
            className="cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            Delete Booking
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UndoModal
        isOpen={undoModalOpen}
        onClose={() => setUndoModalOpen(false)}
        onConfirm={handleUndoAction}
        currentStatus={booking.checkInStatus}
        loading={isLoading}
      />
      <AlertModal
        isOpen={open}
        name={`${canineName}'s booking for this day`}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          if (bookingId) {
            onDelete(bookingId);
          }
          setOpen(false);
        }}
        loading={isLoading}
      />
      <UpcomingBookingsModal
        isOpen={upcomingBookingsModalOpen}
        onClose={() => setUpcomingBookingsModalOpen(false)}
        canineId={selectedCanineId}
        canineName={canineName}
      />
    </>
  );
}
