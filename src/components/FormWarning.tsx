import { CircleAlert } from "lucide-react";

interface FormWarningProps {
  message?: string;
}

export default function FormWarning({ message }: FormWarningProps) {
  if (!message) return null;

  return (
    <div className="mx-auto flex w-fit items-center gap-x-2 rounded-md border border-amber-500 bg-amber-500/15 p-4 text-amber-700">
      <CircleAlert className="text-amber-700" />
      <p className="">{message}</p>
    </div>
  );
}
