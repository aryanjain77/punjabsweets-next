import { connectDB } from "@/lib/db";
import { Product, Order } from "@/lib/models";
import type {
  Product as ProductType,
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
      const it = item as { productId?: unknown; quantity?: unknown; price?: unknown };
      return {
        productId: String(it.productId ?? ""),
        quantity: Number(it.quantity ?? 0),
        price: Number(it.price ?? 0),
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
    const products = await Product.find().lean();
    return products.map(mapProduct)
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
}

export async function getProductById(
  productId: string
): Promise<ProductType | null> {
  await connectDB();
  const product = await Product.findOne({ id: productId }).lean();
  return product as ProductType | null;
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

// ===== SEED DATA =====

export async function seedDefaultProducts() {
  // Seeding should never take the whole app down if Mongo is temporarily unreachable.
  try {
    await connectDB();
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
  }
}
