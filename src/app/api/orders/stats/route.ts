import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { getOrdersPage } from "@/lib/store";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models";

export const runtime = "nodejs";

async function verifyAdminToken(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("adminToken")?.value;
    const adminToken = process.env.ADMIN_TOKEN;
    if (!token || !adminToken) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(adminToken));
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

export async function GET(_request: NextRequest) {
  try {
    const isAdmin = await verifyAdminToken();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [totalOrders, newOrders, confirmedOrders] = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({ status: "new" }),
      Order.countDocuments({ status: "confirmed" }),
    ]);

    const recent = await getOrdersPage({ page: 1, pageSize: 5, status: "all" });

    return NextResponse.json({
      stats: { totalOrders, newOrders, confirmedOrders },
      recentOrders: recent.orders,
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

