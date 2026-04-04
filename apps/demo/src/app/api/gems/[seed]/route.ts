import { NextResponse } from "next/server";
import { decodeGemSeed, isValidGemSeed } from "@/lib/gemImage";
import { getCachedGemImage, getOrCreateGemImage } from "@/lib/gemImageCache.server";

export const runtime = "nodejs";
export const maxDuration = 60;

function imageResponse(pngBytes: ArrayBuffer): NextResponse {
  return new NextResponse(pngBytes, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      "Vercel-CDN-Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=604800",
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ seed: string }> },
) {
  const { seed: raw } = await params;
  const seed = decodeGemSeed(raw);

  if (!isValidGemSeed(seed)) {
    return NextResponse.json({ error: "Invalid seed" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const pngBytes = await getOrCreateGemImage(origin, seed);
  return imageResponse(pngBytes);
}

export async function HEAD(
  _request: Request,
  { params }: { params: Promise<{ seed: string }> },
) {
  const { seed: raw } = await params;
  const seed = decodeGemSeed(raw);

  if (!isValidGemSeed(seed)) {
    return new NextResponse(null, { status: 400 });
  }

  const existingImage = await getCachedGemImage(seed);

  return new NextResponse(null, {
    status: existingImage ? 204 : 404,
  });
}
