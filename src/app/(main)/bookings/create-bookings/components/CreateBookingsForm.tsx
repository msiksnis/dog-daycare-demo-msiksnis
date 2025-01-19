"use client";

import { useMemo, useState } from "react";
import { useQuery, QueryKey, useQueryClient } from "@tanstack/react-query";
import { isAfter, subMonths } from "date-fns";
import { LoaderCircle } from "lucide-react";

import { Canine, Price } from "@prisma/client";
import { Button } from "@/components/ui/button";
import ToggleButton from "./ToggleButton";
import { Calendar } from "@/components/calendars/CalendarForMultipleBookings";
import BookingInfo from "@/components/BookingInfo";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { fetchExistingBookingsAction } from "../actions/fetchExistingBookingsAction";
import { useCreateMultipleBookingsMutation } from "../mutations/useCreateMultipleBookingsMutation";
import { useFetchCanineWithPrepaidPackageQuery } from "../queries/useFetchCanineWithPrepaidPackageQuery";
import kyInstance from "@/lib/ky";
import { Checkbox } from "@/components/ui/checkbox";

interface MultipleBookingsFormProps {
  canine: Canine | null;
}

export default function CreateBookingsForm({
  canine,
}: MultipleBookingsFormProps) {
  const [selectedDates, setSelectedDates] = useState<
    { date: Date; isHalfDay: boolean; price: number; isPrepaid: boolean }[]
  >([]);
  const [sixMonthOverride, setSixMonthOverride] = useState(false);

  const queryClient = useQueryClient();
  const today = useMemo(() => new Date(), []);

  // Fetch canine details with prepaid package information
  const { data: canineWithPackage, isLoading: isLoadingCanineData } =
    useFetchCanineWithPrepaidPackageQuery(canine?.id);

  // Fetch existing bookings for the canine
  const { data: previousBookings = [], isLoading: isLoadingPreviousBookings } =
    useQuery({
      queryKey: ["previousBookings", canine?.id],
      queryFn: () => fetchExistingBookingsAction(canine?.id!),
      enabled: Boolean(canine?.id),
    });

  // Six-month check
  const sixMonthsAgo = subMonths(new Date(), 6);
  const { data: hasRecentBooking, isLoading: isLoadingSixMonthCheck } =
    useQuery({
      queryKey: ["sixMonthCheck", canine?.id],
      queryFn: async () => {
        const existingBookings = await fetchExistingBookingsAction(canine?.id!);
        return existingBookings.some((booking) => {
          const bookingDate = new Date(booking.date);
          return isAfter(bookingDate, sixMonthsAgo);
        });
      },
      enabled: Boolean(canine?.id),
    });

  // Fetch current price details
  const { data: currentPrices } = useQuery({
    queryKey: ["prices"],
    queryFn: () => kyInstance.get("/api/prices").json<Price[]>(),
  });

  // Mutation for creating multiple bookings
  const queryKey: QueryKey = ["bookings", canine?.id];
  const createMultipleBookingsMutation =
    useCreateMultipleBookingsMutation(queryKey);

  // Handle day selection in the calendar
  const handleSelectDays = (newSelectedDays: Date[] | undefined) => {
    if (!currentPrices) {
      console.error("Prices are not available yet");
      return;
    }

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

          // Determine if the canine has a prepaid package
          let isPrepaid = false;
          let price = 0;

          if (canineWithPackage?.prepaidPackagePrice) {
            const packageType = canineWithPackage.prepaidPackagePrice.type;
            const isFullDayBooking = !existingBooking?.isHalfDay;

            if (
              (packageType === "FULL_DAY" && isFullDayBooking) ||
              (packageType === "HALF_DAY" && !isFullDayBooking)
            ) {
              if (
                canineWithPackage.numberOfPrepaidDays &&
                canineWithPackage.numberOfPrepaidDays > 0
              ) {
                isPrepaid = true;
              }
            }
          }

          // Determine the price if not prepaid
          if (!isPrepaid) {
            const priceCategory = existingBooking?.isHalfDay
              ? "HALF_DAY"
              : "FULL_DAY";
            const priceInfo = currentPrices?.find(
              (price) => price.category === priceCategory,
            );
            price = priceInfo ? priceInfo.amount : 0;
          }

          return (
            existingBooking || {
              date: utcDate,
              isHalfDay: false,
              isPrepaid,
              price,
            }
          );
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime()) || [];

    setSelectedDates(updatedDates);
  };

  // Handle toggling between full day and half day for a booking
  const handleToggleHalfDayForDate = (index: number, isHalfDay: boolean) => {
    if (!currentPrices) {
      console.error("Prices are not available yet");
      return;
    }

    const updatedDates = selectedDates.map((booking, idx) => {
      if (idx === index) {
        let isPrepaid = booking.isPrepaid;
        let price = booking.price;

        if (!isPrepaid) {
          const priceCategory = isHalfDay ? "HALF_DAY" : "FULL_DAY";
          const priceInfo = currentPrices.find(
            (price) => price.category === priceCategory,
          );
          price = priceInfo ? priceInfo.amount : 0;
        }

        return { ...booking, isHalfDay, price, isPrepaid };
      }
      return booking;
    });

    setSelectedDates(updatedDates);
  };

  // Handle form submission for booking creation
  const handleSubmit = () => {
    if (!canine?.id || selectedDates.length === 0 || !currentPrices) return;

    const validatedData = {
      canineId: canine.id,
      dates: selectedDates.map((booking) => ({
        date: booking.date,
        isHalfDay: booking.isHalfDay,
        isPrepaid: booking.isPrepaid,
        price: booking.price,
      })),
    };

    const ownerId = canine.ownerId;

    // Trigger the mutation
    createMultipleBookingsMutation.mutate(
      { validatedData, ownerId, currentPrices },
      {
        onSuccess: () => {
          setSelectedDates([]);
          queryClient.invalidateQueries({
            queryKey: ["previousBookings", canine.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["sixMonthCheck", canine.id],
          });
        },
      },
    );
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

  const disabledDates = previousBookings.map(
    (booking) => new Date(booking.date),
  );
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
    <div className="w-screen pb-10 md:w-full md:max-w-fit">
      <div className="mb-4 border bg-card p-4 sm:rounded-md sm:shadow">
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

        <div className="relative h-14 md:h-12">
          {!hasRecentBooking && !isLoadingSixMonthCheck && (
            <div className="absolute left-1/2 top-0 flex w-full -translate-x-1/2 items-center justify-center md:top-3">
              <div className="space-x-2">
                <label>
                  No previous bookings for {canineName} within the last 6
                  months. Override 6-month warning?
                </label>
                <Checkbox
                  checked={sixMonthOverride}
                  onCheckedChange={(checked) =>
                    setSixMonthOverride(checked === true)
                  }
                  className="h-4 w-4"
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={
              selectedDates.length === 0 ||
              (!hasRecentBooking && !sixMonthOverride)
            }
          >
            {createMultipleBookingsMutation.isPending ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Bookings"
            )}
          </Button>
        </div>
      </div>
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
        <div className="self-start border-border bg-card p-4 sm:rounded-md sm:border sm:shadow">
          {previousBookings.length > 0 && (
            <div className="max-w-sm">
              <h3 className="overflow-hidden text-lg font-light text-ring sm:mb-2 md:text-xl">
                <span className="truncate">{canineName}</span> has upcoming
                bookings on:
              </h3>
              <div className="flex flex-col gap-1.5">
                {previousBookings.map((booking, index) => (
                  <BookingInfo
                    key={index}
                    date={new Date(booking.date)}
                    isHalfDay={booking.isHalfDay}
                    className="text-base"
                    badgeClassName="py-1"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
