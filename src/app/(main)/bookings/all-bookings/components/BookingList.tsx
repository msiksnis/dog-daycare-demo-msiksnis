"use client";

import { cn } from "@/lib/utils";
import { QueryKey, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, XIcon } from "lucide-react";
import { useState } from "react";

import Container from "@/components/Container";
import MainLoader from "@/components/MainLoader";
import CreateBookingModal from "@/components/modals/CreateBookingModal";
import UpcomingBookingsModal from "@/components/modals/UpcomingBookingsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useBookingsUIStore from "@/hooks/useBookingsUiStore";
import useDrawerStore from "@/hooks/useDrawerStore";
import useLoadingStore from "@/hooks/useLoadingStore";
import { formatDateToISO } from "@/lib/dateUtils";
import { CheckInStatus } from "@prisma/client";
import { fetchBookingsAction } from "../actions/fetchBookingsAction";
import { useDeleteBookingMutation } from "../mutations/useDeleteBookingMutation";
import { useUpdateStatusMutation } from "../mutations/useUpdateStatusMutation";
import { useUpcomingBookingsQuery } from "../queries/useUpcomingBookingsQuery";
import { BookingWithDetails } from "../types";
import { DateField } from "./DateField";
import DesktopBookingCard from "./DesktopBookingCard";
import MobileBookingCard from "./MobileBookingCard";
import Summary from "./Summary";
import Week from "./Week";

export default function BookingList() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["bookings", selectedDate];

  const {
    filterText,
    createBookingModalOpen,
    upcomingBookingsModalOpen,
    setFilterText,
    setCreateBookingModalOpen,
    setUpcomingBookingsModalOpen,
    setSelectedCanineId,
    setSelectedCanineName,
    selectedCanineId,
    selectedCanineName,
  } = useBookingsUIStore();

  const { loadingStates, setLoading } = useLoadingStore();
  const { openDrawer } = useDrawerStore();

  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: [...queryKey],
    queryFn: () => fetchBookingsAction(formatDateToISO(selectedDate)),
    staleTime: 1000 * 60,
  });

  const {
    data: upcomingBookingDates = {},
    isFetching: isFetchingUpcomingBookings,
  } = useUpcomingBookingsQuery(bookings, [
    "upcomingBookingsQueryKey",
    selectedDate,
  ]);

  const updateStatusMutation = useUpdateStatusMutation(queryKey);
  const deleteBookingMutation = useDeleteBookingMutation(queryKey);

  const handleStatusChange = (bookingId: string, newStatus: CheckInStatus) => {
    setLoading(bookingId, true);
    updateStatusMutation.mutate({ bookingId, status: newStatus });
  };

  const handleDelete = (bookingId: string) => {
    deleteBookingMutation.mutate(bookingId);
  };

  const filteredBookings = bookings.filter((booking) =>
    booking.canine.name.toLowerCase().includes(filterText.toLowerCase()),
  );

  const getBookingCardProps = (booking: BookingWithDetails) => ({
    booking,
    isFetchingUpcomingBookings: false,
    upcomingBookingDate: upcomingBookingDates[booking.canineId] || undefined,
    handleCheckIn: () =>
      handleStatusChange(booking.id, CheckInStatus.CHECKED_IN),
    handleCheckOut: () =>
      handleStatusChange(booking.id, CheckInStatus.CHECKED_OUT),
    handleDelete: () => handleDelete(booking.id),
    handleStatusChange,
    setUpcomingBookingsModalOpen,
    setSelectedCanineName,
    openDrawer,
    loadingUpcomingBooking: isFetchingUpcomingBookings,
    isLoading: loadingStates[booking.id],
    formattedSelectedDate: formatDateToISO(selectedDate),
  });

  return (
    <Container
      className="px-0 pt-0 md:px-4 md:pt-6"
      customHeading={
        bookings.length > 0
          ? `${bookings.length} bookings for ${format(selectedDate, "dd MMM")}`
          : `No bookings for ${format(selectedDate, "dd MMM")}`
      }
    >
      <div className="mx-auto mb-4 max-w-6xl border-b border-t border-border bg-card py-10 shadow-sm md:mt-0 md:rounded-md md:border md:px-2 md:py-4 md:shadow-sm">
        <div className="mb-6 flex items-center justify-between px-4">
          <DateField
            id="date"
            label=""
            value={selectedDate}
            onChange={(value) => setSelectedDate(new Date(value))}
          />
          <Button
            className="dark:hover:bg-accent-hovered flex h-9 items-center justify-between whitespace-nowrap rounded-md px-4 text-sm dark:bg-accent"
            animation="scaleOnTap"
            onClick={() => {
              setCreateBookingModalOpen(true);
            }}
          >
            <Plus size={18} className="mr-2" />
            Add Booking
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <Week
            selectedDate={formatDateToISO(selectedDate)}
            onDateChange={(dateString) => setSelectedDate(new Date(dateString))}
            onFetchBookings={(dateString) => {
              setSelectedDate(new Date(dateString));
              queryClient.invalidateQueries({ queryKey });
            }}
          />
        </div>
        {isLoadingBookings ? (
          <MainLoader className="mt-14" />
        ) : (
          <div>
            {bookings.length === 0 ? (
              <div className="px-4 py-14">
                <div className="text-center text-gray-400">
                  No bookings for this day.
                </div>
              </div>
            ) : (
              <>
                <div className="mt-10 flex flex-row items-center justify-between px-2 pb-4">
                  <div className="relative max-w-60">
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
                      onClick={() => setFilterText("")}
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>

                  <div className="">{/* Print */}</div>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="mt-4 px-4 md:mt-6">
                    <div className="text-center text-gray-400">
                      No bookings match the filter criteria.
                    </div>
                  </div>
                ) : (
                  filteredBookings
                    .sort((a, b) => {
                      const statusOrder = {
                        NOT_CHECKED_IN: 0,
                        CHECKED_IN: 1,
                        CHECKED_OUT: 2,
                      };

                      const statusDiff =
                        statusOrder[a.checkInStatus] -
                        statusOrder[b.checkInStatus];

                      if (statusDiff !== 0) {
                        return statusDiff;
                      } else {
                        return a.canine.name.localeCompare(b.canine.name);
                      }
                    })
                    .map((booking: BookingWithDetails) => (
                      <div key={booking.id}>
                        <div className="md:hidden">
                          <MobileBookingCard
                            {...getBookingCardProps(booking)}
                            setSelectedCanineId={setSelectedCanineId}
                            setSelectedCanineName={setSelectedCanineName}
                            setUpcomingBookingsModalOpen={
                              setUpcomingBookingsModalOpen
                            }
                            openDrawer={openDrawer}
                          />
                        </div>
                        <div className="hidden md:block">
                          <DesktopBookingCard
                            {...getBookingCardProps(booking)}
                            setSelectedCanineId={setSelectedCanineId}
                            setSelectedCanineName={setSelectedCanineName}
                            setUpcomingBookingsModalOpen={
                              setUpcomingBookingsModalOpen
                            }
                            openDrawer={openDrawer}
                          />
                        </div>
                      </div>
                    ))
                )}
              </>
            )}
          </div>
        )}
      </div>
      <CreateBookingModal
        isOpen={createBookingModalOpen}
        onClose={() => setCreateBookingModalOpen(false)}
        onConfirm={() => {
          queryClient.invalidateQueries({ queryKey });
        }}
      />
      <UpcomingBookingsModal
        isOpen={upcomingBookingsModalOpen}
        onClose={() => setUpcomingBookingsModalOpen(false)}
        canineId={selectedCanineId}
        canineName={
          bookings.find((booking) => booking.canineId === selectedCanineId)
            ?.canine.name || ""
        }
      />
      <Summary canineId={selectedCanineId} canineName={selectedCanineName} />
    </Container>
  );
}
