import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    categoryId: { type: String, index: true },
    category: String,
    imageUrl: String,
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

const variantSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    productId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    items: [
      {
        productId: String,
        variantId: String,
        quantity: Number,
        price: Number,
        name: String,
        variantName: String,
      },
    ],
    customerName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    landmark: String,
    pincode: String,
    approxDistanceKm: Number,
    notes: String,
    latitude: Number,
    longitude: Number,
    totalAmount: Number,
    paymentMethod: { type: String, enum: ["upi", "cod"], default: "upi" },
    status: {
      type: String,
      enum: ["new", "confirmed", "preparing", "on_way", "delivered", "cancelled"],
      default: "new",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "received", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export const Variant =
  mongoose.models.Variant || mongoose.model("Variant", variantSchema);

export const Order =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

export const Setting =
  mongoose.models.Setting || mongoose.model("Setting", settingSchema);
