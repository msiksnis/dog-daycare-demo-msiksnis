"use client";

import { motion } from "framer-motion";
import { CheckInStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import CheckInButton from "./CheckInButton";
import { format } from "date-fns";
import { ListCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingWithDetails } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import BookingOptions from "./BookingOptions";

interface BookingCardProps {
  booking: BookingWithDetails;
  handleCheckIn: (bookingId: string) => void;
  handleCheckOut: (bookingId: string) => void;
  handleDelete: (bookingId: string) => void;
  handleStatusChange: (bookingId: string, newStatus: CheckInStatus) => void;
  setUpcomingBookingsModalOpen: (open: boolean) => void;
  setSelectedCanineId: (id: string) => void;
  setSelectedCanineName: (name: string) => void;
  isLoading: boolean;
  openDrawer: () => void;
  upcomingBookingDate?: Date;
  formattedSelectedDate: string;
  loadingUpcomingBooking: boolean;
}

export default function DesktopBookingCard({
  booking,
  handleCheckIn,
  handleCheckOut,
  handleDelete,
  handleStatusChange,
  isLoading,
  openDrawer,
  upcomingBookingDate,
  setSelectedCanineId,
  setSelectedCanineName,
  formattedSelectedDate,
  loadingUpcomingBooking,
}: BookingCardProps) {
  const { canine, checkInStatus, id, isHalfDay } = booking;

  return (
    <motion.div
      className={cn(
        "mx-2 mb-1.5 flex items-center justify-between rounded-md border px-2 shadow-sm transition-all duration-300",
        checkInStatus === CheckInStatus.NOT_CHECKED_IN && "pl-[15px]",
        checkInStatus === CheckInStatus.CHECKED_IN &&
          "border-jade-500 from-jade-50/50 to-jade-100 border-s-8 bg-gradient-to-br shadow-lg",
        checkInStatus === CheckInStatus.CHECKED_OUT &&
          "border-chestnut-600 from-chestnut-50/50 to-chestnut-100 border-s-8 bg-gradient-to-br shadow-lg",
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full overflow-hidden">
        <div className="truncate whitespace-nowrap py-1 text-lg">
          {canine.name}
        </div>
        <div className="flex space-x-2">
          {isHalfDay ? (
            <div className="mb-1 w-16 whitespace-nowrap rounded-full border border-lime-500 bg-lime-300 px-2 py-0.5 text-center text-xs dark:bg-lime-50">
              Half day
            </div>
          ) : (
            <div className="mb-1 w-16 whitespace-nowrap rounded-full border border-purple-400 bg-purple-200 px-2 py-0.5 text-center text-xs dark:bg-purple-50">
              Full day
            </div>
          )}
          {checkInStatus === CheckInStatus.CHECKED_IN ? (
            <motion.div
              className="mb-1 whitespace-nowrap rounded-full border border-gray-400 px-2.5 py-0.5 text-center text-xs dark:text-primary-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Checked in
            </motion.div>
          ) : (
            checkInStatus === CheckInStatus.CHECKED_OUT && (
              <motion.div
                className="mb-1 whitespace-nowrap rounded-full border border-gray-400 px-2.5 py-0.5 text-center text-xs dark:text-primary-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Checked out
              </motion.div>
            )
          )}
          <motion.div
            className="mb-1 flex h-[22px] min-w-[125px] items-center justify-center whitespace-nowrap rounded-full border border-gray-400 px-2.5 py-0.5 text-center text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {loadingUpcomingBooking ? (
              <div className="flex items-center justify-center">
                <div className="loaderDots size-1.5 rounded-full"></div>
              </div>
            ) : upcomingBookingDate ? (
              `Next: ${format(upcomingBookingDate, "PP")}`
            ) : (
              "No upcoming bookings"
            )}
          </motion.div>
        </div>
        <div className="flex items-center justify-between pb-2 pt-1">
          <div className="flex items-center space-x-4">
            <CheckInButton
              checkInStatus={checkInStatus}
              onCheckIn={() => handleCheckIn(id)}
              onCheckOut={() => handleCheckOut(id)}
              isLoading={isLoading}
              formattedSelectedDate={formattedSelectedDate}
            />
            {checkInStatus === CheckInStatus.CHECKED_OUT && (
              <Button
                variant="ghost"
                size="icon"
                onClick={openDrawer}
                className="size-8 border border-slate-600 bg-card"
              >
                <ListCheckIcon className="size-8 cursor-pointer px-1 transition-all duration-200" />
              </Button>
            )}
          </div>
          <BookingOptions
            bookingId={id}
            booking={{
              ...booking,
              overnightStay: booking.overnightStay ?? false,
              previousBookingDate: booking.previousBookingDate ?? null,
              sixMonthWarn: booking.sixMonthWarn ?? false,
              createdAt: booking.createdAt ?? new Date(),
              updatedAt: booking.updatedAt ?? new Date(),
            }}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            canineId={canine.id}
            canineName={canine.name}
            ownerId={canine.ownerId}
            setSelectedCanineId={setSelectedCanineId}
            setSelectedCanineName={setSelectedCanineName}
            openDrawer={openDrawer}
          />
        </div>
      </div>
    </motion.div>
  );
}
