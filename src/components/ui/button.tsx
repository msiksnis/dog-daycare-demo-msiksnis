"use client";

import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { motion, MotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------------------------
   1) CLASS-VARIANCE-AUTHORITY (CVA) CONFIG
------------------------------------------------------------------------------------ */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "from-red-500/15 to-red-400/15 hover:from-red-500/20 hover:to-red-600/20 font-medium transition-all duration-300 bg-gradient-to-br text-destructive-foreground border text-primary border-destructive bg-red-600/20",
        outline:
          "border border-input bg-background font-medium hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      effect: {
        expandIcon: "group gap-0 relative",
        ringHover:
          "transition-all duration-300 hover:ring-2 hover:ring-primary/90 hover:ring-offset-2",
        shine:
          "before:animate-shine relative overflow-hidden before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-no-repeat",
        shineHover:
          "relative overflow-hidden before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:transition-[background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] before:duration-1000",
        gooeyRight:
          "relative z-0 overflow-hidden transition-all duration-500 before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:bg-gradient-to-r from-white/40 before:transition-transform before:duration-1000 hover:before:translate-x-[0%] hover:before:translate-y-[0%]",
        gooeyLeft:
          "relative z-0 overflow-hidden transition-all duration-500 after:absolute after:inset-0 after:-z-10 after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%] after:bg-gradient-to-l from-white/40 after:transition-transform after:duration-1000 hover:after:translate-x-[0%] hover:after:translate-y-[0%]",
        underline:
          "relative !no-underline after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-left after:scale-x-100 hover:after:origin-bottom-right hover:after:scale-x-0 after:transition-transform after:ease-in-out after:duration-300",
        hoverUnderline:
          "relative !no-underline after:absolute after:bg-primary after:bottom-2 after:h-[1px] after:w-2/3 after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300",
      },
      size: {
        default: "h-10 px-4 py-2 text-base font-semibold",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/* ------------------------------------------------------------------------------------
   2) ICON PROPS
------------------------------------------------------------------------------------ */
interface IconProps {
  icon: React.ElementType;
  iconPlacement: "left" | "right";
}
interface IconRefProps {
  icon?: never;
  iconPlacement?: undefined;
}
export type ButtonIconProps = IconProps | IconRefProps;

/* ------------------------------------------------------------------------------------
   3) MAIN BUTTON PROPS, including Next.js 13 formAction + motion animation
------------------------------------------------------------------------------------ */
/**
 * We omit problematic HTML event handlers that conflict with Framer Motion:
 *   - onAnimationStart, onAnimationEnd, onDrag, etc.
 */
type OverriddenMotionEvents =
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragLeave"
  | "onDragOver"
  | "onDrop"
  | "onAnimationIteration";

/**
 * Extend the standard button props with Next.js `formAction`,
 * but omit the event handlers that conflict with MotionProps.
 */
type SafeButtonHTMLAttributes = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  OverriddenMotionEvents
> & {
  /**
   * Next.js 13 custom formAction type
   */
  formAction?: string | ((formData: FormData) => void | Promise<void>);
};

export interface ButtonProps
  extends SafeButtonHTMLAttributes,
    VariantProps<typeof buttonVariants> {
  /**
   * If true, we render a motion.span around <Slot> (for custom children),
   * instead of a real <button>.
   */
  asChild?: boolean;
  /**
   * Choose a Framer Motion animation preset:
   * - "scaleOnTap": scales the button on tap/click
   * - "none": no motion
   */
  animation?: "scaleOnTap" | "none";
}

/* ------------------------------------------------------------------------------------
   4) CREATE A BASE BUTTON WITHOUT the Conflicting Event Handlers
------------------------------------------------------------------------------------ */
const BaseButton = React.forwardRef<
  HTMLButtonElement,
  SafeButtonHTMLAttributes
>((props, ref) => <button ref={ref} {...props} />);
BaseButton.displayName = "BaseButton";

/* ------------------------------------------------------------------------------------
   5) WRAP OUR BaseButton IN FRAMER MOTION
------------------------------------------------------------------------------------ */
const MotionBaseButton = motion.create(BaseButton);

/* ------------------------------------------------------------------------------------
   6) OUR FINAL "Button" COMPONENT
------------------------------------------------------------------------------------ */
const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & ButtonIconProps
>(
  (
    {
      className,
      variant,
      effect,
      size,
      icon: Icon,
      iconPlacement,
      asChild = false,
      animation = "none",
      children,
      ...props
    },
    ref,
  ) => {
    // Merge classes from cva + user
    const _className = cn(buttonVariants({ variant, effect, size, className }));

    /**
     * If `asChild` is used, we wrap children in a motion.span + <Slot>
     * to avoid type conflicts from Radix <Slot> + motion.
     */
    if (asChild) {
      const motionProps: MotionProps =
        animation === "scaleOnTap" ? { whileTap: { scale: 0.93 } } : {};

      return (
        <motion.span
          {...motionProps}
          ref={ref as React.Ref<HTMLSpanElement>}
          className={_className}
        >
          <Slot>
            {/* Left Icon (expandIcon effect) */}
            {Icon && iconPlacement === "left" && effect === "expandIcon" ? (
              <div className="group-hover:translate-x-100 w-0 translate-x-[0%] pr-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:pr-2 group-hover:opacity-100">
                <Icon />
              </div>
            ) : Icon && iconPlacement === "left" ? (
              <Icon />
            ) : null}

            {/* Children */}
            <Slottable>{children}</Slottable>

            {/* Right Icon (expandIcon effect) */}
            {Icon && iconPlacement === "right" && effect === "expandIcon" ? (
              <div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-2 group-hover:opacity-100">
                <Icon />
              </div>
            ) : Icon && iconPlacement === "right" ? (
              <Icon />
            ) : null}
          </Slot>
        </motion.span>
      );
    }

    /**
     * Otherwise, we use MotionBaseButton directly.
     */
    const motionButtonProps: MotionProps =
      animation === "scaleOnTap" ? { whileTap: { scale: 0.93 } } : {};

    return (
      <MotionBaseButton
        ref={ref}
        className={_className}
        {...motionButtonProps}
        {...props}
      >
        {/* Left Icon (expandIcon effect) */}
        {Icon && iconPlacement === "left" && effect === "expandIcon" ? (
          <div className="group-hover:translate-x-100 w-0 translate-x-[0%] pr-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:pr-2 group-hover:opacity-100">
            <Icon />
          </div>
        ) : Icon && iconPlacement === "left" ? (
          <Icon />
        ) : null}

        {/* Children */}
        <Slottable>{children}</Slottable>

        {/* Right Icon (expandIcon effect) */}
        {Icon && iconPlacement === "right" && effect === "expandIcon" ? (
          <div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-2 group-hover:opacity-100">
            <Icon />
          </div>
        ) : Icon && iconPlacement === "right" ? (
          <Icon />
        ) : null}
      </MotionBaseButton>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
