import { NextResponse } from "next/server";
import { getSettingValue } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const fromDb = await getSettingValue("qrCodeUrl");
    return NextResponse.json({
      qrCodeUrl: fromDb || process.env.SHOP_QR_CODE_URL || "/uploads/qr-code.png",
    });
  } catch (error) {
    console.error("Failed to load QR code URL:", error);
    return NextResponse.json(
      { qrCodeUrl: process.env.SHOP_QR_CODE_URL || "/uploads/qr-code.png" },
      { status: 200 }
    );
  }
}

