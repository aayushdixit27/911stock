import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/db";

// GET /api/notifications/unread-count - returns count of unread delivered notifications
export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const count = await getUnreadNotificationCount(userId);

    return NextResponse.json({ count });
  } catch (err) {
    console.error("GET /api/notifications/unread-count error:", err);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
