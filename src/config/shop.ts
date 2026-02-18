const DEFAULT_LAT = 28.723301;   // your desired default
const DEFAULT_LNG = 77.127762;

export const SHOP_CONFIG = {
  shopName: "Punjab Sweets",
  tagline: "Fresh sweets, made with love",
  minOrderTotal: 300, // INR
  maxOrderDistanceKm: 8,
  upiId: process.env.SHOP_UPI_ID || "punjabsweets@upi",
  contactPhone: process.env.SHOP_CONTACT_PHONE || "+91-99999-99999",
  qrCodeImageUrl: process.env.SHOP_QR_CODE_URL || "/uploads/qr-code.png", // NEW
  shopLatitude: Number(process.env.SHOP_LATITUDE) || DEFAULT_LAT, // NEW - for map center
  shopLongitude: Number(process.env.SHOP_LONGITUDE) || DEFAULT_LNG, // NEW - for map center
};

