"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const Modal = DialogPrimitive.Root;

const ModalTrigger = DialogPrimitive.Trigger;

const ModalClose = DialogPrimitive.Close;

const ModalPortal = DialogPrimitive.Portal;

const ModalOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      "bg-dots-pattern dark:bg-dots-pattern-dark",
      "[background-size:4px_4px]",
      "[backdrop-filter:brightness(1.2)_blur(3px)]",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

const ModalVariants = cva(
  cn(
    "fixed z-50 gap-4 bg-background pt-4 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 min-w-[26rem] pb-10 md:pb-6",
    "md:left-[50%] md:top-[50%] md:grid md:w-fit md:max-w-2xl md:translate-x-[-50%] md:translate-y-[-50%] md:border md:duration-200 md:data-[state=open]:animate-in md:data-[state=closed]:animate-out md:data-[state=closed]:fade-out-0 md:data-[state=open]:fade-in-0 md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95 md:data-[state=closed]:slide-out-to-left-1/2 md:data-[state=closed]:slide-out-to-top-[48%] md:data-[state=open]:slide-in-from-left-1/2 md:data-[state=open]:slide-in-from-top-[48%] md:rounded-xl md:overflow-y-scroll no-scrollbar",
  ),
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b rounded-b-xl max-h-[90%] md:h-fit data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t md:h-fit max-h-[90%] rounded-t-xl data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full md:h-fit w-3/4 border-r rounded-r-xl data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full md:h-fit w-3/4 border-l rounded-l-xl data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
        secondary: "!p-0",
      },
    },
    defaultVariants: {
      side: "bottom",
    },
  },
);

interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof ModalVariants> {
  hideCloseButton?: boolean;
}

const ModalContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(
  (
    { side = "bottom", className, children, title, hideCloseButton, ...props },
    ref,
  ) => (
    <ModalPortal>
      <ModalOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          ModalVariants({ side }),
          "px-4 focus-visible:outline-none",
          className,
        )}
        {...props}
      >
        <div className="hidden">
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>description</ModalDescription>
          <ModalClose className="group/close -mr-1 rounded-md p-1 outline-none transition-all duration-300 hover:bg-gray-100 hover:opacity-100 focus:outline-none data-[state=open]:bg-secondary">
            <X className="size-5 opacity-70 group-hover/close:opacity-100" />
            <span className="sr-only">Close</span>
          </ModalClose>
        </div>
        {children}
      </DialogPrimitive.Content>
    </ModalPortal>
  ),
);
ModalContent.displayName = DialogPrimitive.Content.displayName;

const ModalHeader = ({
  className,
  title,
  description,
  hideCloseButton,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  hideCloseButton?: boolean;
}) => (
  <div
    className={cn("flex items-start justify-between bg-white", className)}
    {...props}
  >
    <div className="">
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      {description && <h2 className="font-muted">{description}</h2>}
    </div>
    {!hideCloseButton && (
      <ModalClose className="rounded-md p-0.5 transition hover:bg-gray-100 focus:outline-none">
        <X className="h-5 w-5 text-gray-500" />
        <span className="sr-only">Close</span>
      </ModalClose>
    )}
  </div>
);
ModalHeader.displayName = "ModalHeader";

const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
ModalFooter.displayName = "ModalFooter";

const ModalTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
ModalTitle.displayName = DialogPrimitive.Title.displayName;

const ModalDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ModalDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  ModalTrigger,
};
