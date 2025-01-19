"use client";

import { useEffect } from "react";

import { useDynamicHeaderStore } from "@/hooks/useDynamicHeaderStore";

/**
 * Interface for the props passed to DynamicHeadingSetter component.
 *
 * @interface DynamicHeadingSetterProps
 * @property {string} heading - The main heading text to set dynamically.
 * @property {string} [subHeading] - The optional subHeading text to set dynamically (defaults to an empty string).
 * @property {string} [customHeading] - The optional custom heading text to set dynamically (defaults to an empty string).
 */
interface DynamicHeadingSetterProps {
  heading?: string;
  subHeading?: string;
  customHeading?: string;
}

/**
 * DynamicHeadingSetter component for dynamically updating the heading and subHeading in the global store.
 * Utilizes the `useDynamicHeaderStore` hook to update the header's heading and subHeading.
 *
 * When the component is mounted, it sets the heading and subHeading. Upon unmounting, it resets the values.
 *
 * @param {DynamicHeadingSetterProps} props - Props containing the heading and subHeading to update dynamically.
 * @returns {null} - This component does not render any visible content.
 */
export default function DynamicHeadingSetter({
  heading = "",
  subHeading = "",
  customHeading = "",
}: DynamicHeadingSetterProps): null {
  const { setHeading, setSubHeading, setCustomHeading, reset } =
    useDynamicHeaderStore();

  useEffect(() => {
    // Set the heading and subHeading when the component is mounted
    setHeading(heading);
    setSubHeading(subHeading);
    setCustomHeading(customHeading);

    // Reset the heading and subHeading when the component is unmounted
    return () => {
      reset();
    };
  }, [
    heading,
    subHeading,
    customHeading,
    setHeading,
    setSubHeading,
    setCustomHeading,
    reset,
  ]);

  return null;
}
