"use client";

import BookingInfo from "@/components/BookingInfo";
import UpPreBookingsModal from "@/components/modals/UpOreBookingsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MoreHorizontal, PlusIcon, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import CellAction from "./CellOptions";

type CanineWithSelectedFields = {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string;
    mobile: string | null;
    email: string | null;
  };
  upcomingBookings: Array<{
    date: Date;
    isHalfDay: boolean;
  }>;
  previousBookings: Array<{
    date: Date;
    isHalfDay: boolean;
  }>;
};

export default function Canines({
  data,
}: {
  data: CanineWithSelectedFields[];
}) {
  const [filterText, setFilterText] = useState("");
  const [selectedCanineId, setSelectedCanineId] = useState<string | null>(null);
  const [selectedBookings, setSelectedBookings] = useState<
    { date: Date; isHalfDay: boolean }[]
  >([]);
  const [upPreBookingsModalOpen, setUpPreBookingsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const router = useRouter();

  const filteredCanines = useMemo(() => {
    return data.filter((canine) =>
      canine.name.toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [data, filterText]);

  const handleClearFilter = () => {
    setFilterText("");
  };

  const handleOpenBookingsModal = (
    canineId: string,
    bookings: { date: Date; isHalfDay: boolean }[],
    title: string,
  ) => {
    setSelectedCanineId(canineId);
    setSelectedBookings(bookings);
    setModalTitle(title);
    setUpPreBookingsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="relative max-w-60 md:min-w-60">
          <Input
            placeholder="Filter by name"
            className={cn({ capitalize: filterText })}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            disabled={!filterText}
            className="absolute right-1 top-2 size-6 disabled:opacity-0"
            onClick={handleClearFilter}
          >
            <X className="size-4" />
          </Button>
        </div>
        <Button
          onClick={() => router.push("/canines/new")}
          effect={"shineHover"}
          animation="scaleOnTap"
          className="px-6"
        >
          <PlusIcon className="mr-1.5 h-4 w-4" />
          Add New
        </Button>
      </div>

      <div className="py-6">
        {filteredCanines.map((canine) => {
          const upcomingBookingDate = canine.upcomingBookings[0];
          const upcomingBookingLength = canine.upcomingBookings.length;

          return (
            <div
              key={canine.id}
              className={cn(
                "border border-b-0 border-slate-300 bg-card py-1 transition-colors duration-200 first:rounded-t-md last:rounded-b-md last:border-b even:bg-slate-50 hover:bg-muted",
                { "rounded-md": filteredCanines.length === 1 },
              )}
            >
              <div className="flex h-12 divide-x md:h-14">
                {/* Canine details */}
                <div className="no-scrollbar flex w-[90%] flex-col justify-center overflow-y-scroll px-4 py-0.5 md:w-[45%] md:space-y-1.5 xl:w-[30%]">
                  <Link
                    href={`/canines/${canine.id}`}
                    className="whitespace-nowrap text-lg font-medium underline-offset-2 hover:underline"
                  >
                    {canine.name}
                  </Link>
                  <Link
                    href={`/owners/${canine.owner.id}`}
                    className="flex items-center whitespace-nowrap text-sm font-normal text-secondary-foreground"
                  >
                    Owner: {canine.owner.name}
                  </Link>
                </div>

                {/* Bookings */}
                <div className="hidden w-[45%] md:block xl:w-[30%]">
                  {upcomingBookingDate ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-1 px-4">
                      <BookingInfo
                        date={upcomingBookingDate.date}
                        isHalfDay={upcomingBookingDate.isHalfDay}
                        label="Next visit"
                      />
                      {upcomingBookingLength > 1 && (
                        <button
                          className="group size-fit h-[22px] max-w-[285px] rounded-full px-4 text-xs font-normal transition-all hover:bg-gray-100"
                          onClick={() =>
                            handleOpenBookingsModal(
                              canine.id,
                              canine.upcomingBookings,
                              "Upcoming Bookings",
                            )
                          }
                        >
                          <MoreHorizontal className="size-5 opacity-70 group-hover:opacity-100" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-secondary-foreground">
                      No upcoming bookings
                    </div>
                  )}
                </div>

                {/* Previous Bookings */}
                <div className="hidden w-[30%] xl:block">
                  {canine.previousBookings.length > 0 ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-1 px-4">
                      <BookingInfo
                        date={canine.previousBookings[0].date}
                        label="Last visit"
                        isHalfDay={canine.previousBookings[0].isHalfDay}
                      />
                      {canine.previousBookings.length > 1 && (
                        <button
                          className="group size-fit h-5 transition-all"
                          onClick={() =>
                            handleOpenBookingsModal(
                              canine.id,
                              canine.previousBookings,
                              "Previous Bookings",
                            )
                          }
                        >
                          <MoreHorizontal className="size-5 opacity-70 group-hover:opacity-100" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-secondary-foreground">
                      No previous bookings
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div className="flex w-[10%] items-center justify-center">
                  <CellAction
                    canine={canine}
                    onOpenModal={handleOpenBookingsModal}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {selectedCanineId && (
        <UpPreBookingsModal
          isOpen={upPreBookingsModalOpen}
          onClose={() => setUpPreBookingsModalOpen(false)}
          canineName={
            filteredCanines.find((canine) => canine.id === selectedCanineId)
              ?.name || "Unknown Canine"
          }
          bookings={selectedBookings} // Upcoming or Previous bookings
          title={modalTitle}
        />
      )}
    </div>
  );
}
