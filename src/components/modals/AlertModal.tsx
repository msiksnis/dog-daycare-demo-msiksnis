import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import { ModalBones } from "../ModalBones";

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
    <ModalBones
      title={`Delete ${name}?`}
      description="This action cannot be undone."
      isOpen={isOpen}
      onClose={onClose}
    >
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
          variant="destructive"
          size="lg"
          disabled={loading}
          onClick={onConfirm}
        >
          Delete
        </Button>
      </div>
    </ModalBones>
  );
}
