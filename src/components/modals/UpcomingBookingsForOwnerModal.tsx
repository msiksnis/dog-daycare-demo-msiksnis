import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Modal, ModalContent, ModalHeader } from "../Modal";
import BookingInfo from "../BookingInfo";

interface UpcomingBookingsForOwnerProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId: string;
  ownerName: string;
  bookings: { date: Date; isHalfDay: boolean; canineName: string }[];
}

export default function UpcomingBookingsForOwnerModal({
  isOpen,
  onClose,
  ownerId,
  ownerName,
  bookings,
}: UpcomingBookingsForOwnerProps) {
  const title =
    bookings.length > 0
      ? `${ownerName} ${bookings.length} bookings`
      : `No upcoming bookings for ${ownerName}`;

  // To sort bookings by canineName and date
  const sortedBookings = [...bookings].sort((a, b) => {
    const nameComparison = a.canineName.localeCompare(b.canineName);
    if (nameComparison !== 0) return nameComparison;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader title={title} />
        <div className="space-y-2 pb-4">
          {sortedBookings.map((booking, index) => (
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
