import { useEffect, useRef, useState, forwardRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isAfter } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/calendars/CalendarForBirthDate";

interface DateFieldProps {
  value: Date | null;
  onChange: (value: Date) => void;
  label: string | React.ReactNode;
  id: string;
  name: string;
  disableFutureDates?: boolean;
}

export const DateField = forwardRef<HTMLButtonElement, DateFieldProps>(
  ({ value, onChange, label, id, name, disableFutureDates }, ref) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const formattedDate = value ? format(value, "yyyy-MM-dd") : "Pick a date";

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          setPopoverOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [wrapperRef]);

    // Define the date range for disabling future dates
    const today = new Date();
    const disabledDays = disableFutureDates ? { after: today } : undefined;

    return (
      <div ref={wrapperRef} className="flex text-sm md:h-10 md:w-[700px]">
        <label
          htmlFor={id}
          className={`flex w-1/3 items-center justify-end rounded-s-md border bg-card px-4 py-2 md:whitespace-nowrap ${
            popoverOpen ? "border-[1.5px] border-ring" : ""
          }`}
        >
          {label}
        </label>
        <Popover>
          <PopoverTrigger id={id} asChild>
            <button
              ref={ref}
              name={name}
              type="button"
              className={`flex w-2/3 items-center rounded-md rounded-s-none border bg-card px-4 ${
                popoverOpen ? "border-[1.5px] border-ring" : ""
              } capitalize focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <CalendarIcon className="mr-4 h-4 w-4 opacity-70" />
              {formattedDate}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-full" align="start">
            <Calendar
              mode="single"
              weekStartsOn={1}
              selected={value ? new Date(value) : undefined}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  // Prevent selecting future dates if disableFutureDates is true
                  if (disableFutureDates && isAfter(selectedDate, today)) {
                    return; // Ignore the selection
                  }
                  onChange(selectedDate);
                  setPopoverOpen(false);
                }
              }}
              disabled={disabledDays}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);
DateField.displayName = "DateField";
