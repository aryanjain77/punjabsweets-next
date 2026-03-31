import { NextRequest, NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/store";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const categoryId = `CAT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const categorySlug = (slug && String(slug).trim()) || slugify(name);

    await createCategory({
      id: categoryId,
      name: String(name).trim(),
      slug: categorySlug,
    });

    const categories = await getCategories();
    return NextResponse.json({ success: true, categories }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
