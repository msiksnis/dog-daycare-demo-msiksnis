import prismadb from "@/lib/prismadb";
import { currentUserServer } from "@/lib/serverAuth";

type Params = Promise<{ notificationId: string }>;

export async function PATCH(req: Request, { params }: { params: Params }) {
  try {
    const user = await currentUserServer();

    const { notificationId } = await params;

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prismadb.notificationReadState.updateMany({
      where: {
        notificationId: notificationId,
        userId: user.id,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[MARK_NOTIFICATIONS_AS_READ] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
