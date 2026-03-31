import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import sharp from 'sharp';
import { upsertProduct, getProductById, deleteProduct, setVariantsForProduct, getCategoryById } from '@/lib/store';
import type { Product } from '@/lib/types';
import { uploadImageBuffer } from '@/lib/cloudinary';

export const runtime = "nodejs";

// Helper to verify admin token
async function verifyAdminToken(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;
    const adminToken = process.env.ADMIN_TOKEN;

    if (!token || !adminToken) {
      return false;
    }

    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(adminToken));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const isAdmin = await verifyAdminToken();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const categoryId = formData.get('categoryId') as string;
    const category = formData.get('category') as string;
    const variants = formData.get('variants') as string;
    const imageFile = formData.get('image') as File | null;
    const isAvailable = formData.get('isAvailable') === 'true';

    // Validation
    if (!name || !price || isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: 'Invalid product data' },
        { status: 400 }
      );
    }

    const productId = `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let imageUrl: string | undefined;

    // Handle image upload if provided
    if (imageFile) {
      try {
        const buffer = await imageFile.arrayBuffer();

        // Optimize image using sharp
        const optimizedBuffer = await sharp(buffer)
          .resize(500, 500, {
            fit: 'cover',
            position: 'center',
          })
          .webp({ quality: 85 })
          .toBuffer();

        const uploaded = await uploadImageBuffer({
          buffer: optimizedBuffer,
          folder: "punjab-sweets/products",
          publicId: productId,
          overwrite: true,
          tags: ["product"],
        });
        imageUrl = uploaded.url;
      } catch (error) {
        console.error('Error processing image:', error);
        return NextResponse.json(
          { error: 'Failed to process image' },
          { status: 400 }
        );
      }
    }

    // Resolve category label
    const categoryToUse = categoryId
      ? (await getCategoryById(categoryId))?.name || category
      : category;

    // Create product
    const product: Product = {
      id: productId,
      name,
      description,
      price,
      categoryId: categoryId || undefined,
      category: categoryToUse,
      imageUrl,
      isAvailable,
    };

    // Save product
    await upsertProduct(product);

    if (variants) {
      try {
        const parsed = JSON.parse(variants);
        if (Array.isArray(parsed)) {
          await setVariantsForProduct(productId, parsed);
        }
      } catch (err) {
        console.warn('Could not parse variants JSON:', err);
      }
    }

    return NextResponse.json(
      { success: true, product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading product:', error);
    return NextResponse.json(
      { error: 'Failed to upload product' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authorization
    const isAdmin = await verifyAdminToken();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const categoryId = formData.get('categoryId') as string;
    const variants = formData.get('variants') as string;
    const imageFile = formData.get('image') as File | null;
    const isAvailable = formData.get('isAvailable') === 'true';

    if (!id || !name || !price || isNaN(price)) {
      return NextResponse.json(
        { error: 'Invalid product data' },
        { status: 400 }
      );
    }

    // Get existing product
    const existingProduct = await getProductById(id);

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    let imageUrl = existingProduct.imageUrl;

    // Handle new image upload if provided
    if (imageFile && imageFile.size > 0) {
      try {
        const buffer = await imageFile.arrayBuffer();

        // Optimize image using sharp
        const optimizedBuffer = await sharp(buffer)
          .resize(500, 500, {
            fit: 'cover',
            position: 'center',
          })
          .webp({ quality: 85 })
          .toBuffer();

        const uploaded = await uploadImageBuffer({
          buffer: optimizedBuffer,
          folder: "punjab-sweets/products",
          publicId: existingProduct.id,
          overwrite: true,
          tags: ["product"],
        });
        imageUrl = uploaded.url;
      } catch (error) {
        console.error('Error processing image:', error);
        return NextResponse.json(
          { error: 'Failed to process image' },
          { status: 400 }
        );
      }
    }

    // Resolve category label
    const categoryToUse = categoryId
      ? (await getCategoryById(categoryId))?.name || existingProduct.category
      : existingProduct.category;

    // Update product
    const updatedProduct: Product = {
      ...existingProduct,
      name,
      description,
      price,
      categoryId: categoryId || existingProduct.categoryId,
      category: categoryToUse,
      imageUrl,
      isAvailable,
    };

    await upsertProduct(updatedProduct);

    if (variants) {
      try {
        const parsed = JSON.parse(variants);
        if (Array.isArray(parsed)) {
          await setVariantsForProduct(id, parsed);
        }
      } catch (err) {
        console.warn('Could not parse variants JSON:', err);
      }
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authorization
    const isAdmin = await verifyAdminToken();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      );
    }

    // Delete product from database
    await deleteProduct(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
