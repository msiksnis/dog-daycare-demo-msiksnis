"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  BellIcon,
  CalendarDaysIcon,
  DogIcon,
  MoonIcon,
  PawPrint,
  Settings2Icon,
  ShoppingBagIcon,
  UsersIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { MainNav } from "./MainNav";
import { NotificationCountInfo } from "@/app/(main)/notifications/types";
import NotificationsState from "@/app/(main)/notifications/NotificationsState";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  initialNotificationState: NotificationCountInfo;
}

export function AppSidebar({
  initialNotificationState,
  ...props
}: AppSidebarProps) {
  const pathName = usePathname();
  const isCollapsed = useSidebar().state === "collapsed";

  const navMain = [
    {
      url: `/`,
      title: "Bookings",
      isActive: pathName === `/`,
      icon: <CalendarDaysIcon />,
    },
    {
      url: `/owners`,
      title: "Owners",
      isActive: pathName!.startsWith(`/owners`),
      icon: <UsersIcon />,
    },
    {
      url: `/canines`,
      title: "Canines",
      isActive: pathName!.startsWith(`/canines`),
      icon: <DogIcon />,
    },
    {
      url: `/shop-items`,
      title: "Shop Items",
      isActive: pathName!.startsWith(`/shop`),
      icon: <ShoppingBagIcon />,
    },
    {
      url: `/end-of-day`,
      title: "End of Day",
      isActive: pathName!.startsWith(`/end-of-day`),
      icon: <MoonIcon />,
    },
    {
      url: `/notifications`,
      title: "Notifications",
      isActive: pathName!.startsWith(`/notifications`),
      icon: (
        <div className="relative">
          <BellIcon />
          <div className="absolute -left-0 -top-1">
            <NotificationsState
              initialNotificationState={initialNotificationState}
            />
          </div>
        </div>
      ),
    },
    {
      url: `/settings`,
      title: "Settings",
      isActive: pathName!.startsWith(`/settings`),
      icon: <Settings2Icon />,
    },
  ];

  return (
    <Sidebar className="border-none" collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="p-2">
          <PawPrint
            className={cn("size-12 transition-all duration-300", {
              "size-10": isCollapsed,
            })}
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="mt-[30%]">
        <MainNav items={navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
