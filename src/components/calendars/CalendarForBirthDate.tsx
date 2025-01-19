import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedYear, setSelectedYear] = React.useState(currentYear);
  const [selectedMonth, setSelectedMonth] = React.useState(currentMonth);

  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "long" }),
  );

  const selectedYearIndex = currentYear - selectedYear;

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value, 10));
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(months.indexOf(event.target.value));
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(parseInt(year, 10));
  };

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(months.indexOf(month));
  };

  return (
    <>
      <div className="my-4 flex justify-center space-x-5">
        <Select onValueChange={handleMonthSelect}>
          <SelectTrigger>
            <SelectValue
              placeholder={months[selectedMonth]}
              onChange={handleMonthChange}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {months.map((month, index) => (
                <SelectItem key={index} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select onValueChange={handleYearSelect}>
          <SelectTrigger>
            <SelectValue
              placeholder={years[selectedYearIndex].toString()}
              onChange={handleYearChange}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months:
            "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-0",
          caption: "flex justify-center pt-1 relative items-center hidden",
          caption_label: "text-base font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-10 w-10 bg-transparent p-0 opacity-50 hover:opacity-100",
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex justify-center",
          head_cell:
            "text-muted-foreground rounded-md w-10 md:w-12 font-normal",
          row: "flex justify-center w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent dark:[&:has([aria-selected])]:bg-accent-secondary [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
            props.mode === "range"
              ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
              : "[&:has([aria-selected])]:rounded-md",
          ),
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "size-10 md:size-12 p-1 font-normal aria-selected:opacity-100 xl:text-lg",
          ),
          day_range_start: "day-range-start",
          day_range_end: "day-range-end",
          day_selected:
            "from-blue-chill-200/90 to-blue-chill-300 bg-gradient-to-br text-accent-foreground hover:bg-blue-chill-300 hover:text-accent-foreground focus: focus:text-accent-foreground",
          day_today: "",
          day_outside:
            "day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        month={new Date(selectedYear, selectedMonth)}
        fromYear={years[years.length - 1]}
        toYear={currentYear}
        fixedWeeks
        {...props}
      />
    </>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
