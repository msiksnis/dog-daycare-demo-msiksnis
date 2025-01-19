"use client";

import { useDynamicHeaderStore } from "@/hooks/useDynamicHeaderStore";
import { SidebarTrigger } from "./ui/sidebar";
import UserButton from "./UserButton";
import { ExtendedUser } from "../../next-auth";

interface HeaderProps {
  loading?: boolean;
  user: ExtendedUser;
}

export default function Header({ loading, user }: HeaderProps) {
  const { heading, subHeading, customHeading } = useDynamicHeaderStore();
  return (
    <header className="flex shrink-0 items-center justify-between gap-2 py-2 pr-4 transition-[width,height] ease-linear">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        {loading ? (
          <div className="space-y-2">
            <div className="w-5/2 h-8 animate-pulse rounded bg-gray-300"></div>
            {subHeading && (
              <div className="w-5/1 h-4 animate-pulse rounded bg-gray-300"></div>
            )}
          </div>
        ) : (
          <div className="flex min-h-16 flex-col justify-center whitespace-nowrap">
            <p className="text-xl font-medium tracking-tight text-foreground md:text-3xl">
              {heading}
            </p>
            <p className="pl-0.5 text-xs text-gray-500 md:text-sm">
              {subHeading}
            </p>
            <p className="text-xl font-medium tracking-tight md:text-2xl">
              {customHeading}
            </p>
          </div>
        )}
      </div>
      <UserButton user={user} />
    </header>
  );
}
