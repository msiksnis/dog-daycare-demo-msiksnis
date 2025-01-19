"use client";

import { cn } from "@/lib/utils";

interface ToggleButtonProps {
  isHalfDay: boolean;
  onToggle: (isHalfDay: boolean) => void;
}

export default function ToggleButton({
  isHalfDay,
  onToggle,
}: ToggleButtonProps) {
  return (
    <div
      className={cn(
        "relative flex h-8 rounded-full border border-purple-300 bg-transparent dark:border-accent-secondary",
        { "border-lime-300": isHalfDay },
      )}
    >
      <div
        className={cn(
          "absolute top-0 h-full w-1/2 scale-[102%] rounded-full bg-purple-300 transition-transform duration-200 ease-in-out dark:bg-accent-secondary",
          { "translate-x-full bg-lime-300": isHalfDay },
        )}
      />
      <button
        className={cn(
          "relative z-10 w-1/2 whitespace-nowrap px-4 text-muted-foreground focus:outline-none",
          { "text-text": !isHalfDay },
        )}
        onClick={() => onToggle(false)}
      >
        Full day
      </button>
      <button
        className={cn(
          "relative z-10 w-1/2 whitespace-nowrap px-4 text-muted-foreground focus:outline-none",
          { "text-text": isHalfDay },
        )}
        onClick={() => onToggle(true)}
      >
        Half day
      </button>
    </div>
  );
}
