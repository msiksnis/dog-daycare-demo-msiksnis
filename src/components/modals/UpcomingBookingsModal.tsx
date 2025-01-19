import { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO, addDays, isAfter, startOfDay } from "date-fns";

import { cn } from "@/lib/utils";
import { ModalBones } from "../ModalBones";

interface UpcomingBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  canineId: string;
  canineName: string;
}

export default function UpcomingBookingsModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  canineId,
  canineName,
}: UpcomingBookingsModalProps) {
  const [upcomingBookings, setUpcomingBookings] = useState<
    { date: Date; isHalfDay: boolean }[]
  >([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (canineId) {
      const fetchUpcomingBookings = async () => {
        try {
          const response = await axios.get(
            `/api/bookings/multiple-bookings/${canineId}`,
          );
          const tomorrow = startOfDay(addDays(new Date(), 1));
          const fetchedBookings: { date: Date; isHalfDay: boolean }[] =
            response.data
              .map((booking: { date: string; isHalfDay: boolean }) => ({
                date: parseISO(booking.date),
                isHalfDay: booking.isHalfDay,
              }))
              .filter((booking: { date: Date; isHalfDay: boolean }) =>
                isAfter(booking.date, tomorrow),
              )
              .sort(
                (
                  a: { date: Date; isHalfDay: boolean },
                  b: { date: Date; isHalfDay: boolean },
                ) => a.date.getTime() - b.date.getTime(),
              );
          setUpcomingBookings(fetchedBookings);
        } catch (error) {
          console.error(error);
        }
      };
      fetchUpcomingBookings();
    }
  }, [canineId]);

  if (!isMounted) return null;

  const title =
    upcomingBookings.length > 0
      ? `There ${upcomingBookings.length > 1 ? "are" : "is"} ${
          upcomingBookings.length
        } upcoming booking${
          upcomingBookings.length > 1 ? "s" : ""
        } for ${canineName}:`
      : `There are no upcoming bookings for ${canineName}`;

  return (
    <ModalBones title={title} description="" isOpen={isOpen} onClose={onClose}>
      <div>
        {upcomingBookings.map((booking, index) => (
          <div
            key={index}
            className="mb-2 flex items-center justify-between rounded-full border border-slate-300 pl-4 shadow-sm"
          >
            <div className="">{format(booking.date, "PP")}</div>
            <div
              className={cn(
                "text-text flex w-28 items-center justify-center whitespace-nowrap rounded-full py-1 text-sm font-normal",
                booking.isHalfDay
                  ? "border border-lime-500 bg-lime-300 hover:bg-lime-300"
                  : "border border-purple-400 bg-purple-300 hover:bg-purple-300",
              )}
            >
              {booking.isHalfDay ? "Half Day" : "Full Day"}
            </div>
          </div>
        ))}
      </div>
    </ModalBones>
  );
}
