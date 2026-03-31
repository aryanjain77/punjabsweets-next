import { connectDB } from "@/lib/db";
import { Product, Category, Variant, Order, Setting } from "@/lib/models";
import type {
  Product as ProductType,
  Category as CategoryType,
  Variant as VariantType,
  Order as OrderType,
  OrderStatus,
  PaymentStatus,
} from "@/lib/types";

// ===== PRODUCTS =====

function mapProduct(doc: unknown): ProductType {
  const d = doc as Partial<ProductType> & { isAvailable?: boolean };
  return {
    id: String(d.id ?? ""),
    name: String(d.name ?? ""),
    description: d.description,
    price: Number(d.price ?? 0),
    categoryId: d.categoryId,
    category: d.category,
    imageUrl: d.imageUrl,
    isAvailable: d.isAvailable ?? true,
  };
}

function mapOrder(doc: unknown): OrderType {
  const d = doc as Partial<OrderType> & { items?: unknown[] };
  const items = Array.isArray(d.items) ? d.items : [];
  return {
    id: String(d.id ?? ""),
    items: items.map((item) => {
      const it = item as { productId?: unknown; variantId?: unknown; quantity?: unknown; price?: unknown; name?: unknown; variantName?: unknown };
      return {
        productId: String(it.productId ?? ""),
        variantId: typeof it.variantId === 'string' ? it.variantId : undefined,
        quantity: Number(it.quantity ?? 0),
        price: Number(it.price ?? 0),
        name: typeof it.name === 'string' ? it.name : undefined,
        variantName: typeof it.variantName === 'string' ? it.variantName : undefined,
      };
    }),
    customerName: String(d.customerName ?? ""),
    phone: String(d.phone ?? ""),
    addressLine1: String(d.addressLine1 ?? ""),
    addressLine2: d.addressLine2,
    landmark: d.landmark,
    pincode: String(d.pincode ?? ""),
    approxDistanceKm: Number(d.approxDistanceKm ?? 0),
    notes: d.notes,
    latitude: Number(d.latitude ?? 0),
    longitude: Number(d.longitude ?? 0),
    totalAmount: Number(d.totalAmount ?? 0),
    paymentMethod: d.paymentMethod ?? "upi",
    status: d.status ?? "new",
    paymentStatus: d.paymentStatus ?? "pending",
    createdAt: (d.createdAt as Date) ?? new Date(0),
    updatedAt: (d.updatedAt as Date) ?? new Date(0),
  };
}


export async function getProducts(): Promise<ProductType[]> {
  try {
    await connectDB();
    const [products, categories, variants] = await Promise.all([
      Product.find().lean(),
      Category.find().lean(),
      Variant.find().lean(),
    ]);

    const categoryMap = new Map<string, string>();
    categories.forEach((cat) => {
      if (cat.id && cat.name) categoryMap.set(cat.id, cat.name);
    });

    return products.map((doc) => {
      const p = mapProduct(doc);
      if (p.categoryId && categoryMap.has(p.categoryId)) {
        p.category = categoryMap.get(p.categoryId);
      }

      const variantDocs = variants as unknown as VariantType[];
    p.variants = variantDocs
        .filter((v) => v.productId === p.id)
        .map((v) => ({
          id: String(v.id || ""),
          productId: String(v.productId || ""),
          name: String(v.name || ""),
          price: Number(v.price || 0),
          stock: Number(v.stock || 0),
        }));

      return p;
    });
  } catch (err) {
    console.error("DB failed, returning empty list", err);
    return [];
  }
}

export async function saveProducts(products: ProductType[]) {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
}

export async function upsertProduct(product: ProductType) {
  await connectDB();
  await Product.findOneAndUpdate(
    { id: product.id },
    product,
    { upsert: true, new: true }
  );
}

export async function deleteProduct(productId: string) {
  await connectDB();
  await Product.findOneAndDelete({ id: productId });
  await Variant.deleteMany({ productId });
}

export async function getProductById(
  productId: string
): Promise<ProductType | null> {
  await connectDB();
  const [productDoc, variants] = await Promise.all([
    Product.findOne({ id: productId }).lean(),
    Variant.find({ productId }).lean(),
  ]);

  if (!productDoc) return null;

  const product = mapProduct(productDoc);
  const variantDocs = variants as unknown as VariantType[];
  product.variants = variantDocs.map((v) => ({
    id: String(v.id || ""),
    productId: String(v.productId || ""),
    name: String(v.name || ""),
    price: Number(v.price || 0),
    stock: Number(v.stock || 0),
  }));

  return product;
}

// Categories
export async function getCategories(): Promise<CategoryType[]> {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return categories.map((cat) => ({
    id: String(cat.id || ""),
    name: String(cat.name || ""),
    slug: String(cat.slug || ""),
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
  }));
}

export async function getCategoryById(categoryId: string): Promise<CategoryType | null> {
  await connectDB();
  const cat = await Category.findOne({ id: categoryId }).lean();
  if (!cat) return null;
  const c = cat as unknown as CategoryType;

  return {
    id: String(c.id || ""),
    name: String(c.name || ""),
    slug: String(c.slug || ""),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export async function createCategory(category: CategoryType) {
  await connectDB();
  await Category.create(category);
}

export async function updateCategory(categoryId: string, updates: Partial<CategoryType>) {
  await connectDB();
  await Category.findOneAndUpdate({ id: categoryId }, updates, { new: true });
}

export async function deleteCategory(categoryId: string) {
  await connectDB();
  await Category.findOneAndDelete({ id: categoryId });
  // optionally unlink category from products
  await Product.updateMany({ categoryId }, { $unset: { categoryId: "", category: "" } });
}

// Variants
export async function getVariantsByProduct(productId: string): Promise<{ id: string; productId: string; name: string; price: number; stock?: number }[]> {
  await connectDB();
  const variants = await Variant.find({ productId }).lean();
  const variantDocs = variants as unknown as VariantType[];
  return variantDocs.map((v) => ({
    id: String(v.id || ""),
    productId: String(v.productId || ""),
    name: String(v.name || ""),
    price: Number(v.price || 0),
    stock: Number(v.stock || 0),
  }));
}

export async function setVariantsForProduct(productId: string, variantsList: { id?: string; name: string; price: number; stock?: number }[]) {
  await connectDB();
  // replace existing variants
  await Variant.deleteMany({ productId });
  if (variantsList.length === 0) return;

  const variantsToInsert = variantsList
    .filter((v) => v.name && v.price >= 0)
    .map((v) => ({
      id: v.id || `VAR-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      productId,
      name: v.name,
      price: v.price,
      stock: v.stock ?? 0,
    }));

  await Variant.insertMany(variantsToInsert);
}

// ===== ORDERS =====

export async function getOrders(): Promise<OrderType[]> {
  await connectDB();
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  return orders.map(mapOrder);
}

export async function getOrdersPage(options?: {
  page?: number;
  pageSize?: number;
  status?: OrderStatus | "all";
}): Promise<{ orders: OrderType[]; total: number; page: number; pageSize: number; totalPages: number }> {
  await connectDB();

  const page = Math.max(1, Math.floor(options?.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Math.floor(options?.pageSize ?? 20)));
  const status = options?.status;

  const query: { status?: OrderStatus } = {};
  if (status && status !== "all") {
    query.status = status;
  }

  const [total, docs] = await Promise.all([
    Order.countDocuments(query),
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { orders: docs.map(mapOrder), total, page, pageSize, totalPages };
}

export async function getOrderById(
  orderId: string
): Promise<OrderType | null> {
  await connectDB();
  const order = await Order.findOne({ id: orderId }).lean();
  return order as OrderType | null;
}

export async function addOrder(order: OrderType) {
  await connectDB();
  await Order.create(order);
}

export async function updateOrderStatus(
  orderId: string,
  updates: Partial<Pick<OrderType, "status" | "paymentStatus">>
) {
  await connectDB();
  await Order.findOneAndUpdate({ id: orderId }, updates, { new: true });
}

export async function setOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus
) {
  const updates: Partial<Pick<OrderType, "status" | "paymentStatus">> = {
    status,
  };

  if (paymentStatus) {
    updates.paymentStatus = paymentStatus;
  }

  await updateOrderStatus(orderId, updates);
}

// ===== SETTINGS =====

export async function getSettingValue(key: string): Promise<string | null> {
  await connectDB();
  const doc = await Setting.findOne({ key }).lean();
  const value = (doc as { value?: unknown } | null)?.value;
  return typeof value === "string" ? value : null;
}

export async function setSettingValue(key: string, value: string): Promise<void> {
  await connectDB();
  await Setting.findOneAndUpdate(
    { key },
    { key, value },
    { upsert: true, new: true }
  );
}

// ===== SEED DATA =====

export async function seedDefaultProducts() {
  // Seeding should never take the whole app down if Mongo is temporarily unreachable.
  try {
    await connectDB();
    await seedDefaultCategories();
  } catch (err) {
    console.error("DB unavailable, skipping seedDefaultProducts()", err);
    return;
  }

  const count = await Product.countDocuments();

  if (count === 0) {
    const defaultProducts: ProductType[] = [
      {
        id: "gulab-jamun",
        name: "Gulab Jamun",
        description: "Soft khoya dumplings soaked in saffron sugar syrup.",
        price: 280,
        category: "Traditional",
        imageUrl:
          "https://images.pexels.com/photos/14386732/pexels-photo-14386732.jpeg",
        isAvailable: true,
      },
      {
        id: "rasgulla",
        name: "Rasgulla",
        description: "Spongy cottage cheese balls in light sugar syrup.",
        price: 260,
        category: "Bengali",
        imageUrl:
          "https://images.pexels.com/photos/13713029/pexels-photo-13713029.jpeg",
        isAvailable: true,
      },
      {
        id: "kaju-katli",
        name: "Kaju Katli",
        description: "Thin cashew fudge made with premium kaju.",
        price: 900,
        category: "Premium",
        imageUrl:
          "https://images.pexels.com/photos/16244839/pexels-photo-16244839.jpeg",
        isAvailable: true,
      },
    ];

    await Product.insertMany(defaultProducts);

    // Add simple default variants 
    await setVariantsForProduct("gulab-jamun", [
      { name: "500gm", price: 280, stock: 10 },
      { name: "1000gm", price: 520, stock: 6 },
    ]);
    await setVariantsForProduct("rasgulla", [
      { name: "500gm", price: 260, stock: 8 },
      { name: "1000gm", price: 480, stock: 5 },
    ]);
    await setVariantsForProduct("kaju-katli", [
      { name: "250gm", price: 450, stock: 7 },
      { name: "500gm", price: 900, stock: 2 },
    ]);
  }
}

export async function seedDefaultCategories() {
  await connectDB();

  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany([
      { id: 'cat-traditional', name: 'Traditional', slug: 'traditional' },
      { id: 'cat-bengali', name: 'Bengali', slug: 'bengali' },
      { id: 'cat-premium', name: 'Premium', slug: 'premium' },
      { id: 'cat-seasonal', name: 'Seasonal', slug: 'seasonal' },
    ]);
  }
}
