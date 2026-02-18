import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import fs from "fs";
import { join } from "path";
import { cookies } from "next/headers";
import crypto from "crypto";

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
    const filename = `qr-code-${Date.now()}.${file.name.split('.').pop()}`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    const filepath = join(uploadDir, filename);

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    await writeFile(filepath, buffer);
    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, imageUrl });
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

    // Return current QR code URL from config
    return NextResponse.json({ 
      qrCodeUrl: process.env.SHOP_QR_CODE_URL || "/uploads/qr-code.png" 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get QR code" }, { status: 500 });
  }
}