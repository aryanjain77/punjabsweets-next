import { NextRequest, NextResponse } from "next/server";
import { deleteProduct, getProductById, upsertProduct, setVariantsForProduct, getCategoryById } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { adminToken } = await request.json().catch(() => ({}));
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getProductById(id);
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      categoryId,
      category,
      isAvailable,
      variants,
    } = body;

    const resolvedCategory = categoryId
      ? (await getCategoryById(categoryId))?.name || category
      : category;

    const updatedProduct = {
      ...existing,
      name: name ?? existing.name,
      description: description ?? existing.description,
      price: price ?? existing.price,
      categoryId: categoryId ?? existing.categoryId,
      category: resolvedCategory ?? existing.category,
      isAvailable: typeof isAvailable === 'boolean' ? isAvailable : existing.isAvailable,
    };

    await upsertProduct(updatedProduct);

    if (variants && Array.isArray(variants)) {
      await setVariantsForProduct(id, variants);
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { adminToken } = await request.json().catch(() => ({}));

    if (adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const productId = id;
    
    await deleteProduct(productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
