import { formatDateToISO, formatDayNumber } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { useEffect, useRef } from "react";

interface WeekProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onFetchBookings: (date: string) => void;
}

export default function Week({
  selectedDate,
  onDateChange,
  onFetchBookings,
}: WeekProps) {
  const selectedDateRef = useRef<string>(selectedDate);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  const handleDayClick = (date: Date) => {
    const dateString = formatDateToISO(date);
    onDateChange(dateString);
    onFetchBookings(dateString);
  };

  const daysOfWeek = eachDayOfInterval({
    start: startOfWeek(new Date(selectedDate), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(selectedDate), { weekStartsOn: 1 }),
  });

  return (
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
                  : format(day, "yyyy-MM-dd") < format(new Date(), "yyyy-MM-dd")
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
  );
}
