import { useEffect, useState } from "react";

import RoleChangeForm from "@/app/(main)/settings/profile/requestRole/RoleChangeForm";
import { useIsMobile } from "@/hooks/useMobile";
import { Role } from "@prisma/client";
import { ExtendedUser } from "../../../next-auth";
import { Modal, ModalContent, ModalHeader } from "../Modal";

interface RoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentRole: Role;
  loading: boolean;
  side?: string;
  user: ExtendedUser;
}

export default function RoleChangeModal({
  isOpen,
  onClose,
  onConfirm,
  currentRole,
  loading,
  user,
}: RoleChangeModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const side = isMobile ? "bottom" : "secondary";

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent side={side}>
        <ModalHeader title="Role change request" className="px-4 pt-4" />
        <RoleChangeForm onConfirm={onConfirm} loading={loading} user={user} />
      </ModalContent>
    </Modal>
  );
}
