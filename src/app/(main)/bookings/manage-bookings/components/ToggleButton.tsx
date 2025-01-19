"use client";

import { cn } from "@/lib/utils";

interface ToggleButtonProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function ToggleButton({ checked, onChange }: ToggleButtonProps) {
  return (
    <div
      className={cn(
        "dark:border-accent-secondary relative flex rounded-full border border-purple-300 bg-transparent text-sm",
        { "border-lime-300": checked },
      )}
    >
      <div
        className={cn(
          "dark:bg-accent-secondary absolute top-0 h-full w-1/2 scale-[102%] rounded-full bg-purple-300 transition-transform duration-200 ease-in-out",
          { "translate-x-full bg-lime-300": checked },
        )}
      />
      <button
        className={cn(
          "relative z-10 w-1/2 whitespace-nowrap px-4 py-1 text-muted-foreground focus:outline-none",
          { "text-text": !checked },
        )}
        onClick={() => onChange(false)}
      >
        Full day
      </button>
      <button
        className={cn(
          "relative z-10 w-1/2 whitespace-nowrap px-4 py-1 text-muted-foreground focus:outline-none",
          { "text-text": checked },
        )}
        onClick={() => onChange(true)}
      >
        Half day
      </button>
    </div>
  );
}
