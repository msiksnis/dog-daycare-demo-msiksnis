import { Button } from "@/components/ui/button";
import { CheckInStatus } from "@prisma/client";
import { LoaderCircle } from "lucide-react";

interface CheckInButtonProps {
  checkInStatus: CheckInStatus;
  onCheckIn: () => void;
  onCheckOut: () => void;
  isLoading: boolean;
}

export default function CheckInButton({
  checkInStatus,
  onCheckIn,
  onCheckOut,
  isLoading,
}: CheckInButtonProps) {
  const handleClick = () => {
    if (checkInStatus === CheckInStatus.NOT_CHECKED_IN) {
      onCheckIn();
    } else if (checkInStatus === CheckInStatus.CHECKED_IN) {
      onCheckOut();
    }
  };

  const isDisabled = checkInStatus === CheckInStatus.CHECKED_OUT;
  const buttonText =
    checkInStatus === CheckInStatus.CHECKED_IN ? (
      isLoading ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        "Check Out"
      )
    ) : checkInStatus === CheckInStatus.CHECKED_OUT ? (
      "Checked Out"
    ) : isLoading ? (
      <LoaderCircle className="size-4 animate-spin" />
    ) : (
      "Check In"
    );

  return (
    <Button
      variant="outline"
      className="h-8 w-32 font-normal md:h-9"
      onClick={handleClick}
      disabled={isDisabled || isLoading}
    >
      {buttonText}
    </Button>
  );
}
