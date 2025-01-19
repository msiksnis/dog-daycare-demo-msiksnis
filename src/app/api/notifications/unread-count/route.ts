import prismadb from "@/lib/prismadb";
import { currentUserServer } from "@/lib/serverAuth";

export async function GET() {
  try {
    const user = await currentUserServer();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unreadCount = await prismadb.notification.count({
      where: {
        NotificationReadState: {
          some: {
            userId: user.id,
            read: false,
          },
        },
      },
    });

    const data = { unreadCount };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
