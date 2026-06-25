import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { getSettingValue } from "@/lib/store";
import { adminMessaging } from "@/lib/firebase-admin";

export async function POST() {
  const isAdmin = await verifyAdminToken();

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = await getSettingValue("admin_fcm_token");

  if (!token) {
    return NextResponse.json(
      { error: "No FCM token found" },
      { status: 404 }
    );
  }

  try {
    const response = await adminMessaging.send({
      token,
      notification: {
        title: "Punjab Sweets",
        body: "Test notification successful 🎉",
      },
      webpush: {
        fcmOptions: {
          link: "/admin/orders",
        },
      },
    });

    return NextResponse.json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}