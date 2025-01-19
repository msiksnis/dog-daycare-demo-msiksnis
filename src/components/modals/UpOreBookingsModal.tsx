import BookingInfo from "../BookingInfo";
import { ModalBones } from "../ModalBones";

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
    <ModalBones
      title={modalTitle}
      description=""
      isOpen={isOpen}
      onClose={onClose}
      optionalClassName="py-4 px-2  md:px-4   "
      optionalTitleClassName="text-left w-4/5 text-sm md:text-lg"
    >
      <div className="space-y-2 pb-4">
        {sortedBookings.length > 0 ? (
          sortedBookings.map((booking, index) => (
            <BookingInfo
              key={index}
              date={booking.date}
              isHalfDay={booking.isHalfDay}
              label=""
            />
          ))
        ) : (
          <div>No bookings available</div>
        )}
      </div>
    </ModalBones>
  );
}
