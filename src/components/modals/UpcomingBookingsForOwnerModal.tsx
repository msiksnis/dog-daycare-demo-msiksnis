import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { ModalBones } from "../ModalBones";

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
      ? `${ownerName} bookings (${bookings.length})`
      : `No upcoming bookings for ${ownerName}`;

  // To sort bookings by canineName and date
  const sortedBookings = [...bookings].sort((a, b) => {
    const nameComparison = a.canineName.localeCompare(b.canineName);
    if (nameComparison !== 0) return nameComparison;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <ModalBones
      title={title}
      description=""
      isOpen={isOpen}
      onClose={onClose}
      optionalClassName="max-h-[90vh] overflow-y-scroll no-scrollbar px-2.5 py-4"
      optionalTitleClassName="text-left w-11/12 font-medium text-sm md:text-lg pl-1 -mt-1"
    >
      <div>
        {sortedBookings.map((booking, index) => (
          <div
            key={index}
            className="mb-1 flex items-center justify-between rounded-full border border-slate-300 py-0.5 pl-2 pr-0.5 shadow-sm"
          >
            <div className="w-1/4">{format(booking.date, "PP")}</div>
            <div className="w-2/4 max-w-52 truncate pl-2 text-left">
              {booking.canineName}
            </div>
            <div
              className={cn(
                "text-text flex w-20 items-center justify-center whitespace-nowrap rounded-full py-1 text-xs font-normal",
                booking.isHalfDay
                  ? "bg-lime-300 hover:bg-lime-300"
                  : "bg-purple-300 hover:bg-purple-300",
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
