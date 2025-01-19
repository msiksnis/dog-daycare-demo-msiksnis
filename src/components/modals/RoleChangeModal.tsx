import { useEffect, useState } from "react";

import RoleChangeForm from "@/app/(main)/settings/profile/requestRole/RoleChangeForm";
import { Role } from "@prisma/client";
import { ModalBones } from "../ModalBones";
import { ExtendedUser } from "../../../next-auth";
import { useIsMobile } from "@/hooks/useMobile";

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
    <ModalBones
      title="Request role change"
      optionalTitleClassName="px-4 pt-4"
      description=""
      isOpen={isOpen}
      onClose={onClose}
      side={side}
    >
      <RoleChangeForm onConfirm={onConfirm} loading={loading} user={user} />
    </ModalBones>
  );
}
