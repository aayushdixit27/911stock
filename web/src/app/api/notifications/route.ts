import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDeliveredNotifications, markNotificationRead, getUnreadNotificationCount, type DBNotification } from "@/lib/db";

// GET /api/notifications - returns unread + recent notifications for user
// Only returns notifications where deliver_at <= now() (staggered delivery)
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const includeRead = searchParams.get("includeRead") === "true";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const notifications = await getDeliveredNotifications(userId, {
      includeRead,
      limit,
      offset,
    });

    return NextResponse.json({ 
      notifications,
      pagination: {
        limit,
        offset,
        count: notifications.length,
      }
    });
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
