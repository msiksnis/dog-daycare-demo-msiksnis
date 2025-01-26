"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Plus, X } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

import { CheckInStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import CreateBookingModal from "@/components/modals/CreateBookingModal";
import UpcomingBookingsModal from "@/components/modals/UpcomingBookingsModal";
import useBookingsStore from "@/hooks/useBookingsStore";
import useLoadingStore from "@/hooks/useLoadingStore";
import { DateField } from "./DateField";
import Week from "./Week";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { formatDateToISO } from "@/lib/dateUtils";
import Loader from "@/components/MainLoader";
import DesktopBookingCard from "./DesktopBookingCard";
import MobileBookingCard from "./MobileBookingCard";
import { Booking } from "./types";
import { Input } from "@/components/ui/input";
import useDrawerStore from "@/hooks/useDrawerStore";
import { cn } from "@/lib/utils";
import Summary from "./Summary";
import Container from "@/components/Container";

export default function BookingList() {
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [createBookingModalOpen, setCreateBookingModalOpen] = useState(false);
  const [upcomingBookingsModalOpen, setUpcomingBookingsModalOpen] =
    useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCanineId, setSelectedCanineId] = useState<string>("");
  const [filterText, setFilterText] = useState("");
  const [selectedCanineName, setSelectedCanineName] = useState("");

  const { openDrawer, isDrawerOpen } = useDrawerStore();

  const {
    bookings,
    upcomingBookings,
    setBookings,
    setUpcomingBookings,
    updateBooking,
    removeBooking,
  } = useBookingsStore();
  const { loadingStates, setLoading } = useLoadingStore();

  const selectedDateRef = useRef<Date>(new Date());

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  const fetchBookings = async (date: Date, canineId?: string) => {
    const dateStr = date.toISOString().split("T")[0];
    setIsLoadingBookings(true);

    try {
      // Fetch bookings for the selected date
      const response = await axios.get(`/api/bookings/${dateStr}`, {
        params: { canineId },
      });
      const bookings: Booking[] = response.data.map((booking: any) => ({
        ...booking,
        date: formatDateToISO(new Date(booking.date)),
        canine: {
          ...booking.canine,
          owner: booking.canine.owner,
        },
      }));

      // Fetch all bookings for each canine and filter for upcoming bookings
      const upcomingBookingsData: { [key: string]: Date | null } = {};
      const canineIds = bookings.map((booking) => booking.canineId);

      await Promise.all(
        canineIds.map(async (id) => {
          const allBookingsResponse = await axios.get(
            `/api/bookings/all-bookings/${id}`,
          );
          const allBookings = allBookingsResponse.data.allBookings.map(
            (bookingDate: string) => new Date(bookingDate),
          );

          const upcomingBooking = allBookings.find(
            (bookingDate: Date) => bookingDate > new Date(),
          );

          upcomingBookingsData[id] = upcomingBooking || null;
        }),
      );

      setBookings(bookings);
      setUpcomingBookings(upcomingBookingsData);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookings(selectedDate);
  }, [selectedDate]);

  const handleStatusChange = async (
    bookingId: string,
    newStatus: CheckInStatus,
  ) => {
    setLoading(bookingId, true);
    try {
      await axios.patch(`/api/bookings/book-in-out/${bookingId}`, {
        checkInStatus: newStatus,
      });
      const currentBookings = useBookingsStore.getState().bookings;
      const bookingToUpdate = currentBookings.find(
        (booking) => booking.id === bookingId,
      );
      if (bookingToUpdate) {
        const updatedBooking = {
          ...bookingToUpdate,
          checkInStatus: newStatus,
        };
        updateBooking(updatedBooking);
      }

      if (newStatus === CheckInStatus.CHECKED_OUT) {
        openDrawer();
      }

      toast.success("Booking status changed successfully");
    } catch (error) {
      toast.error("Failed to change booking status");
      console.error("Failed to change booking status:", error);
    } finally {
      setLoading(bookingId, false);
    }
  };

  const handleDelete = async (bookingId: string) => {
    setLoading(bookingId, true);
    try {
      await axios.delete(`/api/bookings/delete/${bookingId}`);
      removeBooking(bookingId);
      toast.success("Booking deleted");
    } catch (error) {
      toast.error("Failed to delete booking");
    } finally {
      setLoading(bookingId, false);
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(event.target.value);
  };

  const handleClearFilter = () => {
    setFilterText("");
  };

  const filteredBookings = bookings.filter((booking) =>
    booking.canine.name.toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <Container heading="Bookings" subHeading={format(selectedDate, "PP")}>
      <div className="border-b border-t border-border bg-card py-10 shadow-sm md:mt-0 md:rounded-md md:border md:px-2 md:py-4 md:shadow-sm">
        <div className="mb-6 flex items-center justify-between px-4">
          <DateField
            id="date"
            label=""
            value={selectedDate}
            onChange={(value) => setSelectedDate(new Date(value))}
          />
          <Button
            variant="default"
            className="dark:hover:bg-accent-hovered flex h-9 items-center justify-between whitespace-nowrap rounded-md px-4 text-sm dark:bg-accent"
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
            onFetchBookings={(dateString) =>
              fetchBookings(new Date(dateString))
            }
          />
        </div>
        {isLoadingBookings ? (
          <Loader className="mt-14" />
        ) : !bookings || !bookings.length ? (
          <div className="mt-4 px-4 md:mt-6">
            <div className="text-center text-gray-400">
              No bookings for this day.
            </div>
          </div>
        ) : (
          <div className="mt-4 md:mt-10">
            <div className="relative max-w-60 px-2 pb-4">
              <Input
                placeholder="Filter by name"
                className={cn({ capitalize: filterText })}
                value={filterText}
                onChange={handleFilterChange}
              />
              <Button
                variant="ghost"
                size="icon"
                disabled={!filterText}
                className="absolute right-3 top-3 size-6 disabled:opacity-0"
                onClick={handleClearFilter}
              >
                <X className="size-4" />
              </Button>
            </div>
            <ContextMenu>
              <ContextMenuTrigger>
                {filteredBookings
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
                  .map((booking: any) => (
                    <div key={booking.id}>
                      <div className="md:hidden">
                        <MobileBookingCard
                          booking={booking}
                          upcomingBookingDate={
                            upcomingBookings[booking.canineId] || undefined
                          }
                          handleCheckIn={() =>
                            handleStatusChange(
                              booking.id,
                              CheckInStatus.CHECKED_IN,
                            )
                          }
                          handleCheckOut={() =>
                            handleStatusChange(
                              booking.id,
                              CheckInStatus.CHECKED_OUT,
                            )
                          }
                          handleDelete={() => handleDelete(booking.id)}
                          handleStatusChange={handleStatusChange}
                          setUpcomingBookingsModalOpen={
                            setUpcomingBookingsModalOpen
                          }
                          setSelectedCanineId={setSelectedCanineId}
                          openDrawer={openDrawer}
                          isLoading={loadingStates[booking.id]}
                        />
                      </div>
                      <div className="hidden md:block">
                        <DesktopBookingCard
                          booking={booking}
                          upcomingBookingDate={
                            upcomingBookings[booking.canineId] || undefined
                          }
                          handleCheckIn={() =>
                            handleStatusChange(
                              booking.id,
                              CheckInStatus.CHECKED_IN,
                            )
                          }
                          handleCheckOut={() =>
                            handleStatusChange(
                              booking.id,
                              CheckInStatus.CHECKED_OUT,
                            )
                          }
                          handleDelete={() => handleDelete(booking.id)}
                          handleStatusChange={handleStatusChange}
                          setUpcomingBookingsModalOpen={
                            setUpcomingBookingsModalOpen
                          }
                          setSelectedCanineId={setSelectedCanineId}
                          openDrawer={openDrawer}
                          isLoading={loadingStates[booking.id]}
                          setSelectedCanineName={setSelectedCanineName}
                        />
                      </div>
                    </div>
                  ))}
              </ContextMenuTrigger>
              <ContextMenuContent className="space-y-1 p-1 text-left">
                <div className="cursor-pointer rounded-sm from-blue-chill-200 to-blue-chill-300 px-1 hover:bg-gradient-to-br">
                  Export list for Excel
                </div>
                <div className="cursor-pointer rounded-sm from-blue-chill-200 to-blue-chill-300 px-1 hover:bg-gradient-to-br">
                  Print list
                </div>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        )}
      </div>
      <CreateBookingModal
        isOpen={createBookingModalOpen}
        onClose={() => setCreateBookingModalOpen(false)}
        onConfirm={() => {
          fetchBookings(selectedDateRef.current);
          setCreateBookingModalOpen(false);
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
