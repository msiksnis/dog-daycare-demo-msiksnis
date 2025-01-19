"use client";

import axios from "axios";
import { isAfter, parseISO, subMonths } from "date-fns";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import toast from "react-hot-toast";

import BookingInfo from "@/components/BookingInfo";
import { Calendar } from "@/components/calendars/CalendarForMultipleBookings";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Canine } from "@prisma/client";
import createMultipleBookingsAction from "../actions/createMultipleBookingsAction";
import ToggleButton from "./ToggleButton";

function SubmitButton({ isDisabled }: { isDisabled: boolean }) {
  const { pending } = useFormStatus();
  if (pending) {
    return (
      <Button type="submit" disabled className="min-w-44 px-6">
        <Spinner />
      </Button>
    );
  }

  return (
    <Button type="submit" disabled={isDisabled} className="min-w-44 px-6">
      Create Bookings
    </Button>
  );
}

interface MultipleBookingsFormProps {
  canine: Canine | null;
}

interface BookingResponse {
  error?: string;
  success?: boolean;
  successfulBookings?: any[];
  failedBookings?: any[];
}

const initialState: BookingResponse = {
  success: false,
  error: undefined,
  successfulBookings: [],
  failedBookings: [],
};

export default function MultipleBookingsForm({
  canine,
}: MultipleBookingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<
    { date: Date; isHalfDay: boolean }[]
  >([]);
  const [previousBookings, setPreviousBookings] = useState<
    { date: Date; isHalfDay: boolean }[]
  >([]);
  const [isSixMonthCheckLoading, setIsSixMonthCheckLoading] = useState(false);
  const [sixMonthWarning, setSixMonthWarning] = useState(false);
  const [sixMonthOverride, setSixMonthOverride] = useState(false);

  const [state, formAction] = useActionState(
    createMultipleBookingsAction,
    initialState,
  );

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (state.success) {
      toast.success("Bookings created successfully!");
      setSelectedDates([]); // Reset selected dates after successful form submission
      fetchPreviousBookings(canine?.id);
    }
  }, [state.success, canine?.id]);

  useEffect(() => {
    if (canine?.id) {
      fetchPreviousBookings(canine.id);
      handleBookingCheck(canine.id);
    }
  }, [canine, today]);

  const fetchPreviousBookings = (canineId: string | undefined) => {
    if (!canineId) return;

    axios
      .get(`/api/bookings/multiple-bookings/${canineId}`)
      .then((response) => {
        const fetchedBookings = response.data
          .map((booking: any) => {
            const date = parseISO(booking.date);
            return {
              date: new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
              ),
              isHalfDay: booking.isHalfDay,
            };
          })
          .filter((booking: { date: Date }) => {
            const todayStart = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
            );
            return booking.date >= todayStart;
          })
          .sort(
            (a: { date: Date }, b: { date: Date }) =>
              a.date.getTime() - b.date.getTime(),
          );
        setPreviousBookings(fetchedBookings);
      })
      .catch((error) => console.error(error));
  };

  const handleBookingCheck = async (canineId: string) => {
    try {
      setIsSixMonthCheckLoading(true);
      const existingBookingsResponse = await axios.get(
        `/api/bookings/all-bookings/${canineId}`,
      );
      const existingBookings = existingBookingsResponse.data.allBookings || [];

      const sixMonthsAgo = subMonths(new Date(), 6);

      const hasRecentBooking = existingBookings.some((dateString: string) => {
        try {
          const bookingDate = new Date(dateString);
          return isAfter(bookingDate, sixMonthsAgo);
        } catch (error) {
          console.error(
            "Error parsing date for six-month check:",
            dateString,
            error,
          );
          return false;
        }
      });

      setSixMonthWarning(!hasRecentBooking);
    } catch (error) {
      console.error("Error checking six-month interval:", error);
      setSixMonthWarning(true);
    } finally {
      setIsSixMonthCheckLoading(false);
    }
  };

  const handleSelectDays = (newSelectedDays: Date[] | undefined) => {
    const updatedDates =
      newSelectedDays
        ?.map((newDate) => {
          const existingBooking = selectedDates.find(
            (booking) => booking.date.getTime() === newDate.getTime(),
          );
          const utcDate = new Date(
            Date.UTC(
              newDate.getFullYear(),
              newDate.getMonth(),
              newDate.getDate(),
            ),
          );
          return existingBooking || { date: utcDate, isHalfDay: false };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime()) || [];

    setSelectedDates(updatedDates);
  };

  const handleToggleHalfDayForDate = (index: number, isHalfDay: boolean) => {
    const updatedDates = selectedDates.map((booking, idx) =>
      idx === index ? { ...booking, isHalfDay: isHalfDay } : booking,
    );
    setSelectedDates(updatedDates);
  };

  const displaySelectedDates = selectedDates.map((booking, index) => (
    <div
      key={index}
      className="mb-1 flex items-center justify-between rounded-full border pl-4 shadow-sm"
    >
      <div>{formatDateToDisplay(booking.date)}</div>
      <ToggleButton
        isHalfDay={booking.isHalfDay}
        onToggle={(isHalfDay) => handleToggleHalfDayForDate(index, isHalfDay)}
      />
    </div>
  ));

  const disabledDates = previousBookings.map((booking) => booking.date);
  const bookedDates = disabledDates;

  const modifiers = {
    disabled: [...disabledDates, { before: today }],
    booked: bookedDates,
  };

  const css = `
    .today { 
      font-size: 1.15em;
      font-weight: bold;
    }
    .booked-day {
      background-color: #ebebeb;
      border-radius: 10%;  
    }
  `;

  const canineName = canine ? canine.name : "";

  return (
    <div className="mx-auto pb-10 md:w-full md:max-w-fit">
      <form
        className="mb-4 border bg-card p-4 sm:rounded-md sm:shadow"
        action={formAction}
      >
        <style>{css}</style>
        <Calendar
          numberOfMonths={2}
          mode="multiple"
          min={1}
          weekStartsOn={1}
          selected={selectedDates.map((booking) => booking.date)}
          onSelect={handleSelectDays}
          modifiers={modifiers}
          modifiersClassNames={{
            today: "today",
            booked: "booked-day",
          }}
        />
        <input
          type="hidden"
          name="dates"
          value={JSON.stringify(selectedDates)}
        />
        <input type="hidden" name="canineId" value={canine?.id} />

        <div className="relative h-14 md:h-12">
          {sixMonthWarning && (
            <div className="absolute left-1/2 top-0 flex w-full -translate-x-1/2 items-center justify-center space-x-3 md:top-3">
              <label>
                No previous bookings for {canineName} within the last 6 months.
                Override 6-month warning?
              </label>
              <Checkbox
                checked={sixMonthOverride}
                onCheckedChange={(checked) =>
                  setSixMonthOverride(checked === true)
                }
                className="size-5"
              />
            </div>
          )}
        </div>
        <div className="flex justify-center">
          <SubmitButton
            isDisabled={
              isLoading ||
              selectedDates.length === 0 ||
              (sixMonthWarning && !sixMonthOverride)
            }
          />
        </div>
      </form>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="self-start border-border bg-card p-4 sm:rounded-md sm:border sm:shadow">
          {selectedDates.length > 0 ? (
            <div>
              <p className="text-lg font-light text-ring sm:mb-2 md:text-xl">
                {selectedDates.length}{" "}
                {selectedDates.length > 1 ? "days" : "day"} selected:
              </p>
              <div>
                <div>{displaySelectedDates}</div>
              </div>
            </div>
          ) : (
            <p className="text-lg font-light text-ring md:text-xl">
              Please pick one or more days.
            </p>
          )}
        </div>
        {previousBookings.length > 0 && (
          <div className="self-start border-border bg-card p-4 sm:rounded-md sm:border sm:shadow">
            <div className="max-w-sm">
              <h3 className="overflow-hidden text-lg font-light text-ring sm:mb-2 md:text-xl">
                <span className="truncate">{canineName}</span> has upcoming
                bookings on:
              </h3>
              <div className="flex flex-col gap-1.5">
                {previousBookings.map((booking, index) => (
                  <BookingInfo
                    key={index}
                    date={booking.date}
                    isHalfDay={booking.isHalfDay}
                    className="text-base"
                    badgeClassName="py-1"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
