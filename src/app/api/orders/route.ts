import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { addOrder, getOrdersPage, getProducts } from "@/lib/store";
import { Order, type OrderStatus } from "@/lib/types";
import { SHOP_CONFIG } from "@/config/shop";
import crypto from "crypto";

export const runtime = "nodejs";

// Helper to verify admin token from cookies
async function verifyAdminToken(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("adminToken")?.value;
    const adminToken = process.env.ADMIN_TOKEN;

    if (!token || !adminToken) {
      return false;
    }

    // Use constant-time comparison
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(adminToken));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin token from secure cookie
    const isAdmin = await verifyAdminToken();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "20");
    const statusParam = searchParams.get("status") ?? "all";
    const allowed: Array<OrderStatus> = [
      "new",
      "confirmed",
      "preparing",
      "on_way",
      "delivered",
      "cancelled",
    ];
    const status: OrderStatus | "all" =
      statusParam === "all"
        ? "all"
        : allowed.includes(statusParam as OrderStatus)
          ? (statusParam as OrderStatus)
          : "all";

    const result = await getOrdersPage({
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 20,
      status,
    });

    return NextResponse.json({
      orders: result.orders,
      pageInfo: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      items,
      customerName,
      phone,
      addressLine1,
      addressLine2,
      landmark,
      pincode,
      approxDistanceKm,
      notes,
      paymentMethod,
      latitude,
      longitude,
    } = body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!customerName || !phone || !addressLine1 || !pincode) {
      return NextResponse.json(
        { error: "Missing required customer details" },
        { status: 400 }
      );
    }

    if (approxDistanceKm > SHOP_CONFIG.maxOrderDistanceKm) {
      return NextResponse.json(
        { error: `Maximum delivery distance is ${SHOP_CONFIG.maxOrderDistanceKm} km` },
        { status: 400 }
      );
    }

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: "Missing delivery location (latitude/longitude)" },
        { status: 400 }
      );
    }

    // Calculate total
    const products = await getProducts();
    let totalAmount = 0;
    const processedItems: { productId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }
      totalAmount += product.price * item.quantity;
      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    if (totalAmount < SHOP_CONFIG.minOrderTotal) {
      return NextResponse.json(
        {
          error: `Minimum order value is ₹${SHOP_CONFIG.minOrderTotal}. Current total: ₹${totalAmount}`,
        },
        { status: 400 }
      );
    }


    const chosenMethod = paymentMethod === "cod" || paymentMethod === "upi" ? paymentMethod : "upi";
    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      items: processedItems,
      customerName,
      phone,
      addressLine1,
      addressLine2,
      landmark,
      pincode,
      approxDistanceKm,
      notes,
      latitude,
      longitude,
      totalAmount,
      paymentMethod: chosenMethod,
      paymentStatus: "pending",
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await addOrder(order);

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        upiId: SHOP_CONFIG.upiId,
        message: "Order created. Please send payment via UPI.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
