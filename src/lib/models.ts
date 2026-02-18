import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: String,
    imageUrl: String,
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    items: [
      {
        productId: String,
        quantity: Number,
        price: Number,
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

export const Order =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

export const Setting =
  mongoose.models.Setting || mongoose.model("Setting", settingSchema);
