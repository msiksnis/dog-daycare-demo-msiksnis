"use client";

import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalTrigger,
} from "@/components/Modal";
import { useRouter } from "next/navigation";
import LoginForm from "../login/LoginForm";

interface LoginButtonProps {
  children?: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
}

export default function LoginButton({
  children,
  mode = "redirect",
  asChild = false,
}: LoginButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/auth/login");
  };

  if (mode === "modal") {
    return (
      <Modal>
        <ModalTrigger asChild={asChild}>{children}</ModalTrigger>

        <ModalContent className="w-full bg-transparent p-0">
          <ModalTitle className="hidden">Log in</ModalTitle>
          <LoginForm />
        </ModalContent>
      </Modal>
    );
  }

  return (
    <span onClick={handleClick} className="cursor-pointer">
      {children}
    </span>
  );
}
