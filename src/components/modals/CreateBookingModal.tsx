import { useEffect, useState } from "react";
import { ModalBones } from "../ModalBones";
import CreateBooking from "@/app/(main)/bookings/manage-bookings/components/CreateBooking";

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
    <ModalBones title="" description="" isOpen={isOpen} onClose={onClose}>
      <CreateBooking onBookingCreated={onConfirm} />
    </ModalBones>
  );
}
