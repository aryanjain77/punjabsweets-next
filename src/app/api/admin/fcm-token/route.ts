import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { getSettingValue, setSettingValue } from "@/lib/store";

export async function GET() {
  const isAdmin = await verifyAdminToken();

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = await getSettingValue("admin_fcm_token");

  return NextResponse.json({
    token,
  });
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminToken();

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();

  if (!body.token) {
    return NextResponse.json(
      { error: "Token required" },
      { status: 400 }
    );
  }

  await setSettingValue(
    "admin_fcm_token",
    body.token
  );

  return NextResponse.json({
    success: true,
  });
}