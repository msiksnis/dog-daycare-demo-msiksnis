import React from "react";
import { cn } from "@/lib/utils";
import { formatDateToDisplay } from "@/lib/dateUtils";

interface BookingInfoProps {
  date: Date;
  isHalfDay: boolean;
  label?: string;
  className?: string;
  badgeClassName?: string;
}

export default function BookingInfo({
  date,
  isHalfDay,
  label,
  className,
  badgeClassName,
}: BookingInfoProps) {
  return (
    <span
      className={cn(
        "flex items-center justify-between space-x-4 rounded-full border border-slate-300 pl-3 text-sm 2xl:space-x-10",
        className,
      )}
    >
      <div className="whitespace-nowrap">
        {label && <span>{label}:</span>} {formatDateToDisplay(date)}
      </div>
      <div
        className={cn(
          "text-text flex items-center justify-center whitespace-nowrap rounded-full px-5 py-0.5",
          badgeClassName,
          isHalfDay ? "bg-lime-300" : "bg-purple-300",
        )}
      >
        {isHalfDay ? "Half Day" : "Full Day"}
      </div>
    </span>
  );
}
