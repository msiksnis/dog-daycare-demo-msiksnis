import BookingInfo from "../BookingInfo";
import { Modal, ModalContent, ModalHeader } from "../Modal";

interface UpPreBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  canineName: string;
  bookings: { date: Date; isHalfDay: boolean }[];
  title: string;
}

export default function UpPreBookingsModal({
  isOpen,
  onClose,
  canineName,
  bookings,
  title,
}: UpPreBookingsModalProps) {
  const modalTitle =
    bookings.length > 0
      ? `${title} for ${canineName}`
      : `There are no ${title.toLowerCase()} for ${canineName}`;

  const sortedBookings = bookings.sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader title={modalTitle} />
        <div className="space-y-2 pb-4">
          {sortedBookings.length > 0 ? (
            sortedBookings.map((booking, index) => (
              <BookingInfo
                key={index}
                date={booking.date}
                isHalfDay={booking.isHalfDay}
              />
            ))
          ) : (
            <div>No bookings available</div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
