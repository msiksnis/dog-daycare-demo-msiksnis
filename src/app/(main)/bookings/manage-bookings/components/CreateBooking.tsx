"use client";

import { Calendar } from "@/components/calendars/CalendarSingle";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useBookingsStore from "@/hooks/useBookingsStore";
import { formatDateToISO, parseDateString } from "@/lib/dateUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { isAfter, subMonths } from "date-fns";
import { Delete, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import useSWR from "swr";
import * as z from "zod";
import ToggleButton from "./ToggleButton";

const formSchema = z.object({
  canineId: z.string().min(1),
  date: z.string(),
  isHalfDay: z.boolean(),
  overnightStay: z.boolean(),
  previousBookingDate: z.string().nullable(),
  sixMonthWarn: z.boolean(),
  checkInStatus: z.enum(["NOT_CHECKED_IN", "CHECKED_IN", "CHECKED_OUT"]),
});

type BookingFormValues = z.infer<typeof formSchema>;

interface CreateBookingProps {
  onBookingCreated: () => void;
  onClose: () => void;
}

interface ExtendedBookingFormValues extends BookingFormValues {
  ownerId: string | null;
}

interface Canine {
  id: string;
  name: string;
  ownerId: string;
}

export default function CreateBooking({
  onBookingCreated,
  onClose,
}: CreateBookingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCanines, setFilteredCanines] = useState<Canine[]>([]);
  const [selectedCanineId, setSelectedCanineId] = useState<string | null>(null);
  const [selectedCanineName, setSelectedCanineName] = useState<string | null>(
    null,
  );
  const [isSixMonthCheckLoading, setIsSixMonthCheckLoading] = useState(false);
  const [sixMonthWarning, setSixMonthWarning] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isAlreadyBooked, setIsAlreadyBooked] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRefs = useRef<HTMLDivElement[]>([]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      canineId: "",
      date: formatDateToISO(new Date()),
      isHalfDay: false,
      overnightStay: false,
      previousBookingDate: null,
      sixMonthWarn: false,
      checkInStatus: "NOT_CHECKED_IN",
    },
  });

  const watchedDate = form.watch("date");

  const resetForm = () => {
    form.reset({
      canineId: "",
      date: formatDateToISO(new Date()),
      isHalfDay: false,
      overnightStay: false,
      previousBookingDate: null,
      sixMonthWarn: false,
      checkInStatus: "NOT_CHECKED_IN",
    });
    setSelectedCanineName(null);
    setSixMonthWarning(false);
    setIsAlreadyBooked(false);
  };

  const { data: canines, error } = useSWR("/api/canines", (url) =>
    axios.get(url).then((res) => res.data),
  );

  const { addBooking } = useBookingsStore();

  const onSubmit = async (data: BookingFormValues) => {
    if (isSixMonthCheckLoading) {
      toast.error("Please wait for the six-month check to complete.");
      return;
    }

    const extendedData: ExtendedBookingFormValues = {
      ...data,
      ownerId,
    };

    if (sixMonthWarning && !data.sixMonthWarn) {
      const CustomToastContent = () => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: "1.75rem", marginRight: "10px" }}>🐶</span>
          <span>Please override the 6-month warning before proceeding.</span>
        </div>
      );
      toast(<CustomToastContent />);
      return;
    }

    try {
      setIsLoading(true);

      const alreadyBooked = await checkExistingBooking(
        data.canineId,
        data.date,
      );

      if (alreadyBooked) {
        const CustomToastContent = () => (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: "1.75rem", marginRight: "10px" }}>🐶</span>
            <span>
              A booking already exists for this canine on the selected date.
            </span>
          </div>
        );
        toast(<CustomToastContent />);
        setIsLoading(false);
        return;
      }

      const response = await axios.post(`/api/bookings`, extendedData);
      const newBooking = response.data;

      addBooking(newBooking);

      resetForm();
      toast.success("New booking added");
      onBookingCreated();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      onBookingCreated();
    }
  };

  const checkExistingBooking = async (canineId: string, date: string) => {
    try {
      const existingBookingsResponse = await axios.get(
        `/api/bookings/all-bookings/${canineId}`,
      );
      const existingBookings = existingBookingsResponse.data.allBookings;

      const bookingExists = existingBookings.some((booking: any) => {
        try {
          const bookingDate = new Date(booking);
          const bookingDateString = formatDateToISO(bookingDate);
          return bookingDateString === date;
        } catch (error) {
          console.error("Error parsing date:", booking, error);
          return false;
        }
      });

      setIsAlreadyBooked(bookingExists);
      return bookingExists;
    } catch (error) {
      console.error("Error checking existing bookings:", error);
      return false;
    }
  };

  useEffect(() => {
    if (searchQuery && canines) {
      const results = canines.filter((canine: Canine) =>
        canine.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredCanines(results);
      setHighlightedIndex(-1);
    } else {
      setFilteredCanines([]);
    }
  }, [searchQuery, canines]);

  useEffect(() => {
    if (selectedCanineId && watchedDate) {
      checkExistingBooking(selectedCanineId, watchedDate);
    }
  }, [selectedCanineId, watchedDate]);

  const checkOtherBookings = async (canineId: string) => {
    try {
      const response = await axios.get(
        `/api/bookings/all-bookings/${canineId}`,
      );
      const bookingDates = response.data.allBookings.map(
        (booking: any) => booking.date,
      );
      const lastBookingDate = bookingDates[0] || null;
      return { lastBookingDate };
    } catch (error) {
      console.error("Error fetching last booking:", error);
      throw new Error("Failed to fetch last booking");
    }
  };

  const handleSelectCanine = async (canine: Canine) => {
    form.setValue("canineId", canine.id);
    form.trigger("canineId");
    setSelectedCanineId(canine.id);
    setSelectedCanineName(canine.name);
    setSearchQuery("");
    setOwnerId(canine.ownerId);

    const { lastBookingDate } = await checkOtherBookings(canine.id);
    form.setValue("previousBookingDate", lastBookingDate);
    if (canine.id) {
      await handleBookingCheck(canine.id);
    }
  };

  const clearSelectedCanine = () => {
    setSelectedCanineName(null);
    setSixMonthWarning(false);
    setIsAlreadyBooked(false);
  };

  const handleBookingCheck = async (canineId: string) => {
    try {
      setIsSixMonthCheckLoading(true);
      const existingBookingsResponse = await axios.get(
        `/api/bookings/all-bookings/${canineId}`,
      );
      const existingBookings = existingBookingsResponse.data.allBookings;

      const sixMonthsAgo = subMonths(new Date(), 6);

      const hasRecentBooking = existingBookings.some((booking: any) => {
        try {
          const bookingDate = new Date(booking);
          return isAfter(bookingDate, sixMonthsAgo);
        } catch (error) {
          console.error(
            "Error parsing date for six-month check:",
            booking,
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      setHighlightedIndex((prevIndex) =>
        Math.min(prevIndex + 1, filteredCanines.length - 1),
      );
      event.preventDefault();
    } else if (event.key === "ArrowUp") {
      setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, -1));
      event.preventDefault();
    } else if (event.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < filteredCanines.length) {
        handleSelectCanine(filteredCanines[highlightedIndex]);
      }
    }
  };

  useEffect(() => {
    if (highlightedIndex >= 0 && highlightedIndex < filteredCanines.length) {
      resultsRefs.current[highlightedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [highlightedIndex]);

  const css = `
    .today { 
      font-size: 1.5em;
    }
  `;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center">
      <Form {...form}>
        <div>
          {!selectedCanineName ? (
            <div className="mb-4 mt-8 md:mt-0">
              <FormField
                control={form.control}
                name="canineId"
                render={({ field }) => (
                  <FormItem className="relative">
                    <Input
                      type="text"
                      placeholder="Search canine by name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      ref={searchInputRef}
                      className="h-9 text-base"
                    />
                    {searchQuery && filteredCanines.length > 0 && (
                      <div className="absolute left-0 z-50 min-w-[50%] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
                        {filteredCanines.map((canine, index) => (
                          <div
                            key={canine.id}
                            ref={(el) => {
                              if (el) {
                                resultsRefs.current[index] = el;
                              }
                            }}
                            className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-stone-100 ${
                              highlightedIndex === index
                                ? "dark:bg-accent-hovered bg-stone-200"
                                : ""
                            }`}
                            onClick={() => handleSelectCanine(canine)}
                          >
                            {canine.name}
                          </div>
                        ))}
                      </div>
                    )}
                    <FormMessage className="ml-0.5 text-xs" />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <>
              {selectedCanineName && (
                <>
                  <div className="flex h-16 items-center justify-between">
                    <span className="text-xl">{selectedCanineName}</span>
                    <button
                      onClick={clearSelectedCanine}
                      className="ml-6 rounded-full transition-all duration-200 ease-in-out hover:-translate-x-0.5"
                    >
                      <Delete className="size-6 text-red-700 opacity-60" />
                    </button>
                  </div>
                  <Separator className="mb-6" />
                </>
              )}
            </>
          )}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <style>{css}</style>
                <Calendar
                  mode="single"
                  numberOfMonths={1}
                  weekStartsOn={1}
                  selected={
                    field.value ? parseDateString(field.value) : undefined
                  }
                  onSelect={(selectedDate) => {
                    if (selectedDate) {
                      field.onChange(formatDateToISO(selectedDate));
                    }
                  }}
                  modifiersClassNames={{
                    today: "today",
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between">
            <div className="">
              {watchedDate ? `${watchedDate}` : "No date selected"}
            </div>
            <FormField
              control={form.control}
              name="isHalfDay"
              render={({ field }) => (
                <FormItem className="flex h-14 items-center space-x-3 space-y-0 py-4">
                  <FormControl>
                    <ToggleButton
                      checked={field.value}
                      onChange={(checked) => field.onChange(checked)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="relative flex w-full pb-10 pt-10 lg:pb-0">
          <div className="absolute top-2">
            {isAlreadyBooked && (
              <div className="mb-4 text-sm text-red-600">
                Booking for this canine already exists on this day.
              </div>
            )}
            {sixMonthWarning && (
              <div className="">
                <TooltipProvider>
                  <Tooltip>
                    <div className="flex items-center space-x-8">
                      <FormField
                        control={form.control}
                        name="sixMonthWarn"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormLabel>Override 6-month warning?</FormLabel>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) =>
                                  field.onChange({ target: { value: checked } })
                                }
                                className="h-4 w-4"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <TooltipTrigger>
                        <Info className="hidden h-5 w-5 text-gray-500 md:block" />
                      </TooltipTrigger>
                    </div>
                    <TooltipContent>
                      <div>
                        There is no previous bookings for {selectedCanineName}{" "}
                        within the last 6 months.
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
          <div className="flex w-full pt-2">
            <Button
              disabled={
                isLoading ||
                isSixMonthCheckLoading ||
                !selectedCanineName ||
                isAlreadyBooked
              }
              size={"lg"}
              effect={"shineHover"}
              animation="scaleOnTap"
              onClick={form.handleSubmit(onSubmit)}
              className="flex flex-1 items-center justify-center whitespace-nowrap rounded-md px-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? <Spinner /> : "Create Booking"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
