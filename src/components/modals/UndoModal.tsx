import { useEffect, useState } from "react";

import { CheckInStatus } from "@prisma/client";
import { Button } from "../ui/button";
import { ModalBones } from "../ModalBones";

interface UndoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentStatus: CheckInStatus | null;
  loading: boolean;
}

export default function UndoModal({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  loading,
}: UndoModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const title = `Reverse it to ${
    currentStatus === CheckInStatus.CHECKED_IN ? "Not Checked In" : "Checked In"
  }?`;

  return (
    <ModalBones title={title} description="" isOpen={isOpen} onClose={onClose}>
      <div className="flex w-full items-center justify-end space-x-2 pt-6">
        <Button
          variant="outline"
          size="lg"
          disabled={loading}
          onClick={onClose}
          className="font-normal"
        >
          Cancel
        </Button>
        <Button
          size="lg"
          disabled={loading}
          onClick={onConfirm}
          className="font-normal"
        >
          Reverse
        </Button>
      </div>
    </ModalBones>
  );
}
