import { useEffect, useState } from "react";

import { Modal, ModalContent, ModalHeader } from "../Modal";
import { Button } from "../ui/button";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  name?: string;
}

export default function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  name,
}: AlertModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader
          title={`Delete ${name}?`}
          description="This action cannot be undone."
          className="border-none"
        />
        <div className="flex w-full items-center justify-end space-x-2 pt-6">
          <Button
            variant="outline"
            animation="scaleOnTap"
            disabled={loading}
            onClick={onClose}
            className="font-normal"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            animation="scaleOnTap"
            disabled={loading}
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
