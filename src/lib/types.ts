export type Variant = {
  id: string;
  productId: string;
  name: string;
  price: number;
  stock?: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  categoryId?: string;
  isAvailable: boolean;
  variants?: Variant[];
};

export type CartItem = {
  productId: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
};

export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "on_way"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "received" | "failed";

export type PaymentMethod = "upi" | "cod";

export type Order = {
  id: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    name?: string;
    variantName?: string;
  }[];
  customerName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  pincode: string;
  approxDistanceKm: number;
  notes?: string;
  latitude: number;
  longitude: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicOrderPayload = {
  id: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
};
