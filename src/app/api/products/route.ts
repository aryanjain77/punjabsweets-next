import { NextRequest, NextResponse } from "next/server";
import {
  getProducts,
  seedDefaultProducts,
  upsertProduct,
} from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  // Industry-standard behavior: if DB is down, return an empty list (or cached data),
  // don't hard-fail the whole storefront.
  await seedDefaultProducts();
  const products = await getProducts();
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      adminToken,
      id,
      name,
      description,
      price,
      category,
      imageUrl,
      isAvailable,
    } = body;

    if (adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!id || !name || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await upsertProduct({
      id,
      name,
      description,
      price,
      category,
      imageUrl,
      isAvailable: isAvailable ?? true,
    });

    const products = await getProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Error saving product:", error);
    return NextResponse.json(
      { error: "Failed to save product" },
      { status: 500 }
    );
  }
}
