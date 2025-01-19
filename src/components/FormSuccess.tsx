import { CircleCheckBig } from "lucide-react";

interface FormSuccessProps {
  message?: string;
}

export default function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-emerald-500/15 p-4 text-sm font-semibold text-emerald-600">
      <CircleCheckBig className="text-lg text-emerald-600" />
      <p>{message}</p>
    </div>
  );
}
