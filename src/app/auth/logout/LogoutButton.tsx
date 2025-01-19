"use client";

import { logoutAction } from "./actions/logoutAction";

interface LogoutButtonProps {
  children: React.ReactNode;
}

export default function LogoutButton({ children }: LogoutButtonProps) {
  const handleLogout = () => {
    logoutAction();
  };

  return (
    <span onClick={handleLogout} className="cursor-pointer">
      {children}
    </span>
  );
}
