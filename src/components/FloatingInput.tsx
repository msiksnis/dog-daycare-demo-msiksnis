import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FloatingInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, value, ...props }, ref) => {
  return (
    <Input
      placeholder=" "
      className={cn("peer h-12 pt-3 !text-base", className)}
      ref={ref}
      value={value ?? undefined}
      {...props}
    />
  );
});
FloatingInput.displayName = "FloatingInput";

const FloatingLabel = React.forwardRef<
  React.ComponentRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  return (
    <Label
      className={cn(
        "pointer-events-none absolute start-2 top-1 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-text rounded-md border bg-white px-2 text-base text-gray-500 duration-300",
        "peer-focus:top-1 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:border-primary peer-focus:px-2",
        "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:border-white peer-placeholder-shown:px-2 peer-focus:text-primary",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
FloatingLabel.displayName = "FloatingLabel";

type FloatingLabelInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

const FloatingLabelInput = React.forwardRef<
  React.ComponentRef<typeof FloatingInput>,
  React.PropsWithoutRef<FloatingLabelInputProps>
>(({ id, label, ...props }, ref) => {
  return (
    <div className="relative">
      <FloatingInput ref={ref} id={id} {...props} />
      <FloatingLabel htmlFor={id}>{label}</FloatingLabel>
    </div>
  );
});
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingInput, FloatingLabel, FloatingLabelInput };
