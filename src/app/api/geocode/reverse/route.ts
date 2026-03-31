import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export const runtime = "nodejs";

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

type ReverseGeocodeResult = {
  displayName: string;
  lat: number;
  lng: number;
};

const cache = new Map<string, { value: ReverseGeocodeResult; expiresAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h

function cacheKey(lat: number, lng: number) {
  // Round to reduce cache cardinality while keeping usefulness.
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

async function reverseGeocodeNominatim(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: {
      // Nominatim requires a descriptive User-Agent per usage policy.
      "User-Agent": "PunjabSweetsAdmin/1.0 (reverse-geocode)",
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { display_name?: unknown };
  const displayName = typeof data?.display_name === "string" ? data.display_name : "";
  if (!displayName) return null;

  return { displayName, lat, lng };
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminToken();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const latRaw = searchParams.get("lat");
    const lngRaw = searchParams.get("lng");

    const lat = latRaw ? Number(latRaw) : NaN;
    const lng = lngRaw ? Number(lngRaw) : NaN;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: "Invalid lat/lng" }, { status: 400 });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: "lat/lng out of range" }, { status: 400 });
    }

    const key = cacheKey(lat, lng);
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && cached.expiresAt > now) {
      return NextResponse.json({ ok: true, result: cached.value, cached: true });
    }

    const result = await reverseGeocodeNominatim(lat, lng);
    if (!result) {
      return NextResponse.json({ ok: false, error: "No address found" }, { status: 404 });
    }

    cache.set(key, { value: result, expiresAt: now + CACHE_TTL_MS });
    return NextResponse.json({ ok: true, result, cached: false });
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return NextResponse.json({ error: "Failed to reverse geocode" }, { status: 500 });
  }
}

