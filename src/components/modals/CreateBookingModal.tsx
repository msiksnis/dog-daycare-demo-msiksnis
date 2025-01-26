import CreateBooking from "@/app/(main)/bookings/manage-bookings/components/CreateBooking";
import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader } from "../Modal";

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CreateBookingModal({
  isOpen,
  onClose,
  onConfirm,
}: CreateBookingModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader title="Add new booking" />
        <CreateBooking onBookingCreated={onConfirm} onClose={onClose} />
      </ModalContent>
    </Modal>
  );
}
