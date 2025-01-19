import React, { useEffect, useRef, useState } from "react";
import { CalendarIcon } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/calendars/CalendarSingleBooking";
import { formatDateToISO } from "@/lib/dateUtils";

interface DateFieldProps {
  value: Date;
  onChange: (value: string) => void;
  label: string;
  id: string;
}

export function DateField({ value, onChange, label, id }: DateFieldProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const dateString = formatDateToISO(selectedDate);
      onChange(dateString);
      setPopoverOpen(false); // Close the popover after selecting a date
    }
  };

  return (
    <div ref={wrapperRef} className="">
      <label htmlFor={id} className="">
        {label}
      </label>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger id={id} asChild>
          <button
            onClick={() => setPopoverOpen((prev) => !prev)}
            className="flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-red-600 px-2 text-sm"
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
            {value ? formatDateToISO(value) : "Pick a date"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="" align="start">
          <Calendar
            mode="single"
            weekStartsOn={1}
            selected={value}
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
