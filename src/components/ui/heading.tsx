import { cn } from "@/lib/utils";

interface HeadingProps {
  title: string;
  description?: string;
  className?: string;
}

export default function Heading({
  title,
  description,
  className,
}: HeadingProps) {
  return (
    <div>
      <h2
        className={cn(
          "text-2xl font-semibold tracking-tight text-foreground md:text-3xl",
          className,
        )}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-0.5 text-xs text-gray-500 md:text-sm">{description}</p>
      )}
    </div>
  );
}
