import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div
      className={cn(
        "mx-auto space-y-3 pt-32 text-center transition-all duration-300",
      )}
    >
      <h1 className="text-3xl font-bold">Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}
