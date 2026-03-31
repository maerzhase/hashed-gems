import { get } from "@vercel/blob";
import type { Rarity } from "@m3000/hashed-gems";
import { getGemProperties } from "@m3000/hashed-gems";
import { ImageResponse } from "next/og";
import { getGemAssetUrl } from "@/lib/gemAssetUrl";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

const RARITY_BADGE_COLORS: Record<Rarity, { bg: string; text: string }> = {
  common: { bg: "#262626", text: "#a3a3a3" },
  uncommon: { bg: "#14532d", text: "#86efac" },
  rare: { bg: "#1e3a5f", text: "#93c5fd" },
  epic: { bg: "#3b0764", text: "#d8b4fe" },
  legendary: { bg: "#78350f", text: "#fde68a" },
};

async function getGemImageSrc(seed: string): Promise<string> {
  if (process.env.NODE_ENV === "production") {
    return getGemAssetUrl(seed);
  }

  const pathname = `gems/${encodeURIComponent(seed)}.png`;

  try {
    const result = await get(pathname, { access: "public" });
    if (result?.statusCode === 200 && result.stream) {
      const bytes = await new Response(result.stream).arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      return `data:${result.blob.contentType};base64,${base64}`;
    }
  } catch {
    // Fall back to the public URL when authenticated blob fetch is unavailable.
  }

  return getGemAssetUrl(seed);
}

export default async function Image({
  params,
}: {
  params: Promise<{ seed: string }>;
}) {
  const { seed: raw } = await params;
  const seed = decodeURIComponent(raw);
  const gemImageSrc = await getGemImageSrc(seed);

  const { gemTypeName, cutTypeName, rarityName } = getGemProperties(seed);
  const badge = RARITY_BADGE_COLORS[rarityName];

  const displaySeed = seed.length > 20 ? `${seed.slice(0, 20)}…` : seed;
  const seedFontSize = seed.length > 16 ? (seed.length > 20 ? 34 : 40) : 48;
  const gemSize = 208;
  const pillStyle = {
    display: "flex",
    alignItems: "center",
    borderRadius: 999,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 22,
    lineHeight: 1,
  } as const;

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#0a0a0a",
        paddingLeft: 108,
        paddingRight: 96,
        paddingTop: 72,
        paddingBottom: 72,
      }}
    >
      {/* Gem */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: 360,
          height: 360,
        }}
      >
        <div style={{ display: "flex", width: gemSize, height: gemSize }}>
          {/* biome-ignore lint/performance/noImgElement: next/og context, <Image> not available */}
          <img
            src={gemImageSrc}
            width={gemSize}
            height={gemSize}
            alt={seed}
          />
        </div>
      </div>

      {/* Text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignSelf: "center",
          flex: 1,
          maxWidth: 620,
          gap: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              lineHeight: 1,
            }}
          >
            <span
              style={{
                fontSize: seedFontSize - 8,
                fontWeight: 600,
                color: "#404040",
                marginRight: 4,
              }}
            >
              @
            </span>
            <span
              style={{
                fontSize: seedFontSize,
                fontWeight: 600,
                color: "#f5f5f5",
              }}
            >
              {displaySeed}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                ...pillStyle,
                background: badge.bg,
                color: badge.text,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {rarityName}
            </div>
            <div
              style={{
                ...pillStyle,
                background: "#262626",
                color: "#a3a3a3",
                textTransform: "capitalize",
              }}
            >
              {gemTypeName}
            </div>
            <div
              style={{
                ...pillStyle,
                background: "#262626",
                color: "#a3a3a3",
                textTransform: "lowercase",
              }}
            >
              {cutTypeName} cut
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "#525252",
            fontSize: 22,
            lineHeight: 1,
          }}
        >
          Get yours → gems.m3000.io
        </div>
      </div>
    </div>,
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
