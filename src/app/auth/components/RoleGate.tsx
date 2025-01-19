"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ALLOWED_USER_ROUTES } from "@/routes";
import FormWarning from "@/components/FormWarning";
import Container from "@/components/Container";
import MainLoader from "@/components/MainLoader";

interface RoleGateProps {
  children: React.ReactNode;
  role: string;
}

export default function RoleGate({ children, role }: RoleGateProps) {
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const isNotUSER = role !== "USER";
    const userCanAccess =
      role === "USER" && ALLOWED_USER_ROUTES.includes(pathname);

    setCanAccess(isNotUSER || userCanAccess);
  }, [pathname, role]);

  if (canAccess === null) {
    return (
      <Container>
        <MainLoader />
      </Container>
    );
  }

  return (
    <main>
      {canAccess ? (
        <>{children}</>
      ) : (
        <Container>
          <FormWarning message="You don't have permission to view this content!" />
        </Container>
      )}
    </main>
  );
}
