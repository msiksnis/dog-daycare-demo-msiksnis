"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useImperativeHandle, useRef, useState } from "react";

interface UseAutosizeTextAreaProps {
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
  minHeight?: number;
  maxHeight?: number;
  triggerAutoSize: string;
}

export const useAutosizeTextArea = ({
  textAreaRef,
  triggerAutoSize,
  maxHeight = Number.MAX_SAFE_INTEGER,
  minHeight = 0,
}: UseAutosizeTextAreaProps) => {
  const [init, setInit] = React.useState(true);
  React.useEffect(() => {
    // To reset the height momentarily and get the correct scrollHeight for the textarea
    const offsetBorder = 2;
    const textAreaElement = textAreaRef.current;
    if (textAreaElement) {
      if (init) {
        textAreaElement.style.minHeight = `${minHeight + offsetBorder}px`;
        if (maxHeight > minHeight) {
          textAreaElement.style.maxHeight = `${maxHeight}px`;
        }
        setInit(false);
      }
      textAreaElement.style.height = `${minHeight + offsetBorder}px`;
      const scrollHeight = textAreaElement.scrollHeight;
      // Here the height is set directly, outside of the render loop
      // Trying to set this with state or a ref will produce an incorrect value.
      if (scrollHeight > maxHeight) {
        textAreaElement.style.height = `${maxHeight}px`;
      } else {
        textAreaElement.style.height = `${scrollHeight + offsetBorder}px`;
      }
    }
  }, [triggerAutoSize, minHeight, maxHeight]);
};

export type AutosizeTextAreaRef = {
  textArea: HTMLTextAreaElement;
  focus: () => void;
  maxHeight: number;
  minHeight: number;
};

type AutosizeTextAreaProps = {
  maxHeight?: number;
  minHeight?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const AutosizeTextarea = React.forwardRef<
  AutosizeTextAreaRef,
  AutosizeTextAreaProps
>(
  (
    {
      maxHeight = Number.MAX_SAFE_INTEGER,
      minHeight = 52,
      className,
      onChange,
      value,
      placeholder = " ", // Ensure placeholder is non-empty
      ...props
    }: AutosizeTextAreaProps,
    ref: React.Ref<AutosizeTextAreaRef>,
  ) => {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const [triggerAutoSize, setTriggerAutoSize] = useState("");

    useAutosizeTextArea({
      textAreaRef,
      triggerAutoSize: triggerAutoSize,
      maxHeight,
      minHeight,
    });

    useImperativeHandle(ref, () => ({
      textArea: textAreaRef.current as HTMLTextAreaElement,
      focus: () => textAreaRef.current?.focus(),
      maxHeight,
      minHeight,
    }));

    React.useEffect(() => {
      setTriggerAutoSize(value as string);
    }, [props?.defaultValue, value]);

    return (
      <textarea
        {...props}
        placeholder={placeholder}
        value={value}
        ref={textAreaRef}
        className={cn(
          "peer flex min-h-[60px] w-full rounded-md border border-input bg-transparent bg-white px-3 pb-2 pt-3.5 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        onChange={(e) => {
          setTriggerAutoSize(e.target.value);
          onChange?.(e);
        }}
      />
    );
  },
);
AutosizeTextarea.displayName = "AutosizeTextarea";

const FloatingTextareaLabel = React.forwardRef<
  React.ComponentRef<"label">,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "pointer-events-none absolute start-2 top-1 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-text rounded-md border bg-white px-2 text-base text-gray-700 duration-200",
        "peer-placeholder-shown:top-6 peer-placeholder-shown:scale-100 peer-placeholder-shown:border-white peer-placeholder-shown:text-gray-500",
        "peer-focus:top-1 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:border-primary peer-focus:text-gray-700",
        className,
      )}
      {...props}
    />
  );
});
FloatingTextareaLabel.displayName = "FloatingTextareaLabel";

type FloatingTextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    maxHeight?: number;
    minHeight?: number;
    className?: string;
    labelClassName?: string;
  };

const FloatingLabelTextarea = React.forwardRef<
  AutosizeTextAreaRef,
  React.PropsWithoutRef<FloatingTextareaProps>
>(
  (
    { label, id, maxHeight, minHeight, className, labelClassName, ...props },
    ref,
  ) => {
    return (
      <div className="relative">
        <AutosizeTextarea
          id={id}
          ref={ref}
          maxHeight={maxHeight}
          minHeight={minHeight}
          className={cn("peer h-auto", className)}
          {...props}
        />
        <FloatingTextareaLabel htmlFor={id} className={labelClassName}>
          {label}
        </FloatingTextareaLabel>
      </div>
    );
  },
);
FloatingLabelTextarea.displayName = "FloatingLabelTextarea";

export { FloatingLabelTextarea, FloatingTextareaLabel };
