import Header from "@/components/Header";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import prismadb from "@/lib/prismadb";
import { currentRoleServer, currentUserServer } from "@/lib/serverAuth";
import RoleGate from "../auth/components/RoleGate";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default async function MainLayout({ children }: MainLayoutProps) {
  const user = await currentUserServer();
  const role = (await currentRoleServer()) || "";

  if (!user) return null;

  const [unreadNotificationsCount] = await Promise.all([
    prismadb.notification.count({
      where: {
        NotificationReadState: {
          some: {
            userId: user.id,
            read: false,
          },
        },
      },
    }),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar
        initialNotificationState={{ unreadCount: unreadNotificationsCount }}
      />
      <SidebarInset>
        <Header user={user} />
        <RoleGate role={role}>{children}</RoleGate>
      </SidebarInset>
    </SidebarProvider>
  );
}
