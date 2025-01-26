import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { useEffect, useRef } from "react";

import { formatDateToISO, formatDayNumber } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Props for the Week component.
 * @typedef {Object} WeekProps
 * @property {string} selectedDate - The currently selected date in ISO format.
 * @property {function} onDateChange - Callback function to handle date change.
 * @property {function} onFetchBookings - Callback function to fetch bookings for a date.
 */
interface WeekProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onFetchBookings: (date: string) => void;
}

/**
 * Week component to display a week view with selectable days and navigation arrows.
 * @param {WeekProps} props - The props for the component.
 * @returns {JSX.Element} The rendered week component.
 */
export default function Week({
  selectedDate,
  onDateChange,
  onFetchBookings,
}: WeekProps) {
  const selectedDateRef = useRef<string>(selectedDate);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  /**
   * Handles the click event on a day.
   * @param {Date} date - The date of the clicked day.
   */
  const handleDayClick = (date: Date) => {
    const dateString = formatDateToISO(date);
    onDateChange(dateString);
    onFetchBookings(dateString);
  };

  /**
   * Navigate to the previous week.
   */
  const handlePreviousWeek = () => {
    const currentDate = new Date(selectedDate);
    const newDate = subWeeks(currentDate, 1);
    const newDateString = formatDateToISO(newDate);
    onDateChange(newDateString);
    onFetchBookings(newDateString);
  };

  /**
   * Navigate to the next week.
   */
  const handleNextWeek = () => {
    const currentDate = new Date(selectedDate);
    const newDate = addWeeks(currentDate, 1);
    const newDateString = formatDateToISO(newDate);
    onDateChange(newDateString);
    onFetchBookings(newDateString);
  };

  const daysOfWeek = eachDayOfInterval({
    start: startOfWeek(new Date(selectedDate), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(selectedDate), { weekStartsOn: 1 }),
  });

  return (
    <div className="flex w-full items-center justify-between md:px-4">
      <button
        type="button"
        className="rounded-md p-1 opacity-60 transition-all duration-200 hover:bg-gray-100 hover:opacity-100"
        onClick={handlePreviousWeek}
      >
        <ChevronLeft className="size-8" strokeWidth={1.5} />
      </button>

      <div className="grid w-full grid-cols-7">
        {daysOfWeek.map((day, index) => (
          <div
            key={index}
            className="flex w-full cursor-pointer items-center justify-between p-1"
            onClick={() => handleDayClick(day)}
          >
            <div className="mx-auto grid grid-rows-2">
              <div className="flex justify-center text-sm text-secondary-foreground">
                {format(day, "EEE")}
              </div>
              <div
                className={cn(
                  "flex justify-center rounded px-2 pb-1 pt-1.5",
                  format(day, "dd") === format(new Date(selectedDate), "dd")
                    ? "text-text bg-gradient-to-br from-blue-chill-200/90 to-blue-chill-300 tabular-nums dark:text-input"
                    : format(day, "yyyy-MM-dd") <
                        format(new Date(), "yyyy-MM-dd")
                      ? "text-gray-400 dark:text-gray-500"
                      : "dark:text-foreground",
                )}
              >
                {formatDayNumber(day)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="rounded-md p-1 opacity-60 transition-all duration-200 hover:bg-gray-100 hover:opacity-100"
        onClick={handleNextWeek}
      >
        <ChevronRight className="size-8" strokeWidth={1.5} />
      </button>
    </div>
  );
}
