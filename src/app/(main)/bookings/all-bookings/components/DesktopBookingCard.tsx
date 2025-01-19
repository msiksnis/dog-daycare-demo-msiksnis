"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";

import { CheckInStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ListCheckIcon } from "lucide-react";
import { BookingWithDetails } from "../types";
import CheckInButton from "./CheckInButton";
import BookingOptions from "./BookingOptions";
import useBookingsUIStore from "@/hooks/useBookingsUiStore";

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
  const { setUpcomingBookingsModalOpen } = useBookingsUIStore();
  const { canine, checkInStatus, id, isHalfDay } = booking;

  return (
    <motion.div
      className={cn(
        "@container/card mx-2 mb-1.5 flex items-center justify-between rounded-md border px-2 py-2 shadow-sm transition-all duration-300",
        checkInStatus === CheckInStatus.CHECKED_IN &&
          "border-jade-500 from-jade-50/50 to-jade-100 border-s-8 bg-gradient-to-br shadow-sm",
        checkInStatus === CheckInStatus.CHECKED_OUT &&
          "border-chestnut-600 from-chestnut-50/50 to-chestnut-100 border-s-8 bg-gradient-to-br shadow-sm",
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid h-11 grid-rows-3 items-center">
        <div
          className={`row-span-2 -mt-2.5 ml-1 truncate whitespace-nowrap text-lg`}
        >
          {canine.name}
        </div>
        <div className="flex space-x-2">
          <div className="flex space-x-2">
            {isHalfDay ? (
              <div className="mb-1 w-16 whitespace-nowrap rounded-full border border-lime-500 bg-lime-300 px-2 py-0.5 text-center text-xs shadow-sm dark:bg-lime-50 dark:text-primary-foreground">
                Half day
              </div>
            ) : (
              <div className="mb-1 w-16 whitespace-nowrap rounded-full border border-purple-400 bg-purple-200 px-2 py-0.5 text-center text-xs shadow-sm dark:bg-purple-50 dark:text-primary-foreground">
                Full day
              </div>
            )}
          </div>
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
          <div className="@[30rem]/card:block mb-1 hidden">
            <Button
              disabled={!upcomingBookingDate}
              className={cn(
                "flex h-[22px] min-w-[125px] items-center justify-center whitespace-nowrap rounded-full border border-gray-400 bg-transparent px-2.5 py-0.5 text-center text-xs text-primary hover:bg-card disabled:opacity-100",
                { "bg-card": upcomingBookingDate },
              )}
              onClick={() => {
                setSelectedCanineId(booking.canineId);
                setUpcomingBookingsModalOpen(true);
              }}
            >
              {loadingUpcomingBooking ? (
                <div className="flex items-center justify-center">
                  <div className="loaderDots size-1 rounded-full" />
                </div>
              ) : upcomingBookingDate ? (
                `Next: ${format(upcomingBookingDate, "PP")}`
              ) : (
                "No upcoming bookings"
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <div className="flex items-center space-x-4">
          {checkInStatus === CheckInStatus.CHECKED_OUT && (
            <button
              onClick={() => {
                openDrawer();
              }}
              className="size-9 rounded-md bg-card opacity-70 transition-opacity duration-200 hover:opacity-100"
            >
              <ListCheckIcon className="size-8 cursor-pointer px-1 transition-all duration-200" />
            </button>
          )}
          <CheckInButton
            checkInStatus={checkInStatus}
            onCheckIn={() => handleCheckIn(id)}
            onCheckOut={() => handleCheckOut(id)}
            isLoading={isLoading}
            formattedSelectedDate={formattedSelectedDate}
          />
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
    </motion.div>
  );
}
