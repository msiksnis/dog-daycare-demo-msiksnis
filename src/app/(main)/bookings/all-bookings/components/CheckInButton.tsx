import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CheckInStatus } from "@prisma/client";
import { isToday } from "date-fns";

interface CheckInButtonProps {
  checkInStatus: CheckInStatus;
  onCheckIn: () => void;
  onCheckOut: () => void;
  isLoading: boolean;
  formattedSelectedDate: string;
}

export default function CheckInButton({
  checkInStatus,
  onCheckIn,
  onCheckOut,
  isLoading,
  formattedSelectedDate,
}: CheckInButtonProps) {
  const handleClick = () => {
    if (checkInStatus === CheckInStatus.NOT_CHECKED_IN) {
      onCheckIn();
    } else if (checkInStatus === CheckInStatus.CHECKED_IN) {
      onCheckOut();
    }
  };

  const isTodaySelected = isToday(formattedSelectedDate);

  const isDisabled =
    checkInStatus === CheckInStatus.CHECKED_OUT ||
    isLoading ||
    !isTodaySelected;

  const buttonText = isLoading ? (
    <LoaderCircle className="size-4 animate-spin" />
  ) : checkInStatus === CheckInStatus.CHECKED_IN ? (
    "Check Out"
  ) : checkInStatus === CheckInStatus.CHECKED_OUT ? (
    "Checked Out"
  ) : (
    "Check In"
  );

  return (
    <Button
      variant="outline"
      className="h-8 w-32 font-normal md:h-9"
      onClick={handleClick}
      disabled={isDisabled}
    >
      {buttonText}
    </Button>
  );
}
