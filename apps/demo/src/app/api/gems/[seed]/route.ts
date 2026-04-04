import { NextResponse } from "next/server";
import { decodeGemSeed, isValidGemSeed } from "@/lib/gemImage";
import {
  getGemImageObjectKey,
  getOrCreateGemImage,
} from "@/lib/gemImageCache.server";
import { getGemImageResponseHeaders } from "@/lib/gemImage.server";
import { getR2PublicUrl, headR2Object } from "@/lib/r2.server";

export const runtime = "nodejs";
export const maxDuration = 60;

function imageResponse(pngBytes: ArrayBuffer): NextResponse {
  return new NextResponse(pngBytes, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      ...getGemImageResponseHeaders(),
    },
  });
}

function redirectTo(url: string): NextResponse {
  return new NextResponse(null, {
    status: 307,
    headers: {
      Location: url,
      ...getGemImageResponseHeaders(),
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

  const objectKey = getGemImageObjectKey(seed);
  const cached = await headR2Object(objectKey);

  if (cached) {
    return redirectTo(getR2PublicUrl(objectKey));
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

  const objectKey = getGemImageObjectKey(seed);
  const existingImage = await headR2Object(objectKey);

  return new NextResponse(null, {
    status: existingImage ? 204 : 404,
    headers: getGemImageResponseHeaders(),
  });
}
