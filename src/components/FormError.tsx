import { CircleAlert } from "lucide-react";

interface FormErrorProps {
  message?: string;
}

export default function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-destructive/15 p-4 text-sm text-destructive">
      <CircleAlert className="text-lg text-destructive" />
      <p>{message}</p>
    </div>
  );
}
