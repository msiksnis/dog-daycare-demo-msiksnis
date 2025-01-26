import { useEffect, useState } from "react";

import { CheckInStatus } from "@prisma/client";
import { Modal, ModalContent, ModalHeader } from "../Modal";
import { Button } from "../ui/button";

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
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader title={title} />
        <div className="flex w-full items-center justify-end space-x-2 pt-6">
          <Button
            variant="outline"
            disabled={loading}
            onClick={onClose}
            className="font-normal"
          >
            Cancel
          </Button>
          <Button
            disabled={loading}
            onClick={onConfirm}
            className="font-normal"
          >
            Reverse
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
