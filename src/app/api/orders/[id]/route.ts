// import { NextRequest, NextResponse } from "next/server";
// import { getOrders, updateOrderStatus } from "@/lib/store";
// import { Order } from "@/lib/types";
// import { cookies } from "next/headers";
// import crypto from "crypto";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const adminToken = request.headers.get("x-admin-token");

//     if (adminToken !== process.env.ADMIN_TOKEN) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { id } = await params;
//     const orders = getOrders();
//     const order = orders.find((o) => o.id === id);

//     if (!order) {
//       return NextResponse.json({ error: "Order not found" }, { status: 404 });
//     }

//     return NextResponse.json({ order });
//   } catch (error) {
//     console.error("Error fetching order:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch order" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get("adminToken")?.value;
//     const adminToken = process.env.ADMIN_TOKEN;

//     if (!token || !adminToken) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     let isAuthorized = false;
//     try {
//       isAuthorized = crypto.timingSafeEqual(
//         Buffer.from(token),
//         Buffer.from(adminToken)
//       );
//     } catch {
//       isAuthorized = false;
//     }

//     if (!isAuthorized) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { id } = await params;
//     const body = await request.json();
//     const { status, paymentStatus } = body;

//     if (!status && !paymentStatus) {
//       return NextResponse.json(
//         { error: "No updates provided" },
//         { status: 400 }
//       );
//     }

//     const updates: Partial<Pick<Order, "status" | "paymentStatus">> = {};
//     if (status) updates.status = status;
//     if (paymentStatus) updates.paymentStatus = paymentStatus;

//     updateOrderStatus(id, updates);

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error updating order:", error);
//     return NextResponse.json(
//       { error: "Failed to update order" },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/store";
import { Order } from "@/lib/types";
import { cookies } from "next/headers";
import crypto from "crypto";

export const runtime = "nodejs";

// Helper function to verify admin token from cookies
async function verifyAdminToken(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("adminToken")?.value;
    const adminToken = process.env.ADMIN_TOKEN;

    if (!token || !adminToken) {
      return false;
    }

    // Use constant-time comparison to prevent timing attacks
    try {
      return crypto.timingSafeEqual(
        Buffer.from(token),
        Buffer.from(adminToken)
      );
    } catch {
      // Buffer lengths don't match
      return false;
    }
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await verifyAdminToken();

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await verifyAdminToken();

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    if (!status && !paymentStatus) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    const updates: Partial<Pick<Order, "status" | "paymentStatus">> = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    await updateOrderStatus(id, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
