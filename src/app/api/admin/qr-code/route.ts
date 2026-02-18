import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { uploadImageBuffer } from "@/lib/cloudinary";
import { getSettingValue, setSettingValue } from "@/lib/store";

async function verifyAdminToken(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("adminToken")?.value;
    const adminToken = process.env.ADMIN_TOKEN;
    if (!token || !adminToken) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(adminToken));
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await verifyAdminToken();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaded = await uploadImageBuffer({
      buffer,
      folder: "punjab-sweets/qr",
      publicId: "qr-code",
      overwrite: true,
      tags: ["qr"],
    });

    await setSettingValue("qrCodeUrl", uploaded.url);

    return NextResponse.json({ success: true, imageUrl: uploaded.url });
  } catch (error) {
    console.error("Error uploading QR code:", error);
    return NextResponse.json({ error: "Failed to upload QR code" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const isAuthorized = await verifyAdminToken();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fromDb = await getSettingValue("qrCodeUrl");
    return NextResponse.json({
      qrCodeUrl: fromDb || process.env.SHOP_QR_CODE_URL || "/uploads/qr-code.png",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get QR code" }, { status: 500 });
  }
}