import { notificationsInclude } from "@/app/(main)/notifications/types";
import prismadb from "@/lib/prismadb";
import { currentUserServer } from "@/lib/serverAuth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 10;

    const user = await currentUserServer();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prismadb.notification.findMany({
      where: {
        OR: [
          { handledAt: null },
          {
            handledAt: {
              gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days
            },
          },
        ],
      },
      include: notificationsInclude,
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor =
      notifications.length > pageSize ? notifications[pageSize].id : null;

    const data = {
      notifications: notifications.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
