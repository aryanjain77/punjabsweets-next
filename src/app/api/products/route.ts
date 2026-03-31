import { NextRequest, NextResponse } from "next/server";
import {
  getProducts,
  seedDefaultProducts,
  upsertProduct,
  setVariantsForProduct,
} from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
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
      categoryId,
      category,
      imageUrl,
      isAvailable,
      variants,
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
      categoryId,
      category,
      imageUrl,
      isAvailable: isAvailable ?? true,
    });

    if (variants && Array.isArray(variants)) {
      await setVariantsForProduct(
        id,
        variants.map((item) => {
          const variant = item as {
            id?: string;
            name?: string;
            price?: number;
            stock?: number;
          };
          return {
            id: variant.id,
            name: String(variant.name ?? ""),
            price: Number(variant.price ?? 0),
            stock: Number(variant.stock ?? 0),
          };
        })
      );
    }

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
