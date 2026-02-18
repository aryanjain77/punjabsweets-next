import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose, { Schema } from "mongoose";

const ExampleSchema = new Schema(
  {
    title: String,
    description: String,
  },
  { timestamps: true }
);

const ExampleModel = mongoose.models.Example || mongoose.model("Example", ExampleSchema);

export async function GET() {
  try {
    await connectDB();
  } catch (err) {
    // Fail-soft: return a clear 503 and let the frontend show fallback UI.
    return NextResponse.json({ ok: false, error: "DB_CONNECT_ERROR" }, { status: 503 });
  }

  try {
    const items = await ExampleModel.find({}).limit(50).lean();
    return NextResponse.json({ ok: true, data: items });
  } catch (err) {
    console.error("DB query error:", err);
    return NextResponse.json({ ok: false, error: "DB_QUERY_ERROR" }, { status: 500 });
  }
}
