import { cn } from "@/lib/utils";
import DynamicHeadingSetter from "./DynamicHeaderSetter";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  heading?: string;
  subHeading?: string;
  customHeading?: string;
}

export default function Container({
  children,
  className,
  heading,
  subHeading,
  customHeading,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "flex min-h-[calc(100vh-100px)] flex-1 flex-col items-center gap-4 bg-muted/50 px-4 py-6 pb-0 md:mx-4 md:mb-4 md:rounded-xl",
        className,
      )}
    >
      <div className="w-full flex-1">
        <DynamicHeadingSetter
          heading={heading}
          subHeading={subHeading}
          customHeading={customHeading}
        />
        {children}
      </div>
    </div>
  );
}
