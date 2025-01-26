import axios from "axios";
import { addDays, format, isAfter, parseISO, startOfDay } from "date-fns";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Modal, ModalContent, ModalHeader } from "../Modal";
import BookingInfo from "../BookingInfo";

interface UpcomingBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  canineId: string;
  canineName: string;
}

export default function UpcomingBookingsModal({
  isOpen,
  onClose,
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
      ? `${upcomingBookings.length} upcoming booking${
          upcomingBookings.length > 1 ? "s" : ""
        } for ${canineName}`
      : `There are no upcoming bookings for ${canineName}`;

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader title={title} />
        <div className="space-y-2 pb-4">
          {upcomingBookings.map((booking, index) => (
            <BookingInfo
              key={index}
              date={booking.date}
              isHalfDay={booking.isHalfDay}
            />
          ))}
        </div>
      </ModalContent>
    </Modal>
  );
}
