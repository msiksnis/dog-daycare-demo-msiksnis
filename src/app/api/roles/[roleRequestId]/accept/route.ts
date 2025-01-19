import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { currentUserServer } from "@/lib/serverAuth";
import { sendRoleAcceptedEmail } from "@/lib/mail";

type Params = Promise<{ roleRequestId: string }>;

export async function PATCH(req: Request, { params }: { params: Params }) {
  try {
    const user = await currentUserServer();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roleRequestId } = await params;

    if (!roleRequestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 },
      );
    }

    // Update the role request and approve it
    const updatedRequest = await prismadb.roleRequest.update({
      where: { id: roleRequestId },
      data: {
        status: "ACCEPTED",
        approvedAt: new Date(),
        handledById: user.id,
      },
      include: {
        user: true,
      },
    });

    // Fetch the user's name to include in the notification message
    const userDetails = await prismadb.user.findUnique({
      where: { id: updatedRequest.userId },
      select: {
        name: true,
        email: true,
      },
    });

    // const userName = userDetails?.name || "User";
    const userEmail = userDetails?.email || "";

    // Update all notifications related to this request
    await prismadb.notification.updateMany({
      where: { requestId: roleRequestId },
      data: {
        handledById: user.id,
        handledAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // New notification for the user
    // await prismadb.notification.create({
    //   data: {
    //     type: "OTHER",
    //     requestedById: updatedRequest.userId,
    //     title: "Role Request Approved",
    //     message: `${userName}'s request for ${updatedRequest.requestedRole} role has been approved.`,
    //     requestId: roleRequestId,
    //   },
    // });

    await sendRoleAcceptedEmail(userEmail, updatedRequest.requestedRole);

    // Update the user's role
    await prismadb.user.update({
      where: { id: updatedRequest.userId },
      data: { role: updatedRequest.requestedRole },
    });

    return NextResponse.json(
      { message: "Role request accepted" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[ACCEPT_ROLE_REQUEST] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
