import { cn } from "@/lib/utils";

interface MainLoaderProps {
  className?: string;
}

export default function MainLoader({ className }: MainLoaderProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="main-loader">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
