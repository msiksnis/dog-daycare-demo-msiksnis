import Container from "@/components/Container";
import Notifications from "./Notifications";
import { currentRoleServer, currentUserServer } from "@/lib/serverAuth";

export default async function NotificationsPage() {
  const user = await currentUserServer();
  const role = (await currentRoleServer()) || "";

  const currentUserId = user?.id || "";

  return (
    <Container heading="Notifications">
      <Notifications currentUserId={currentUserId} currentUserRole={role} />
    </Container>
  );
}
