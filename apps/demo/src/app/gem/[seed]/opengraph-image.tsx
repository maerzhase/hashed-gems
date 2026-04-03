import type { Rarity } from "@m3000/hashed-gems";
import { getGemProperties } from "@m3000/hashed-gems";
import { headers } from "next/headers";
import { ImageResponse } from "next/og";
import { getGemApiImageUrl, getGemSiteUrl } from "@/lib/gemAssetUrl";
import { loadInterFont } from "@/app/ogFont";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

const RARITY_BADGE_COLORS: Record<
  Rarity,
  { bg: string; text: string; border: string }
> = {
  common: { bg: "#262626", text: "#d4d4d4", border: "#404040" },
  uncommon: {
    bg: "rgba(2, 44, 34, 0.7)",
    text: "#6ee7b7",
    border: "rgba(16, 185, 129, 0.25)",
  },
  rare: {
    bg: "rgba(23, 37, 84, 0.7)",
    text: "#93c5fd",
    border: "rgba(59, 130, 246, 0.25)",
  },
  epic: {
    bg: "rgba(46, 16, 101, 0.7)",
    text: "#c4b5fd",
    border: "rgba(139, 92, 246, 0.3)",
  },
  legendary: {
    bg: "rgba(69, 26, 3, 0.6)",
    text: "#fcd34d",
    border: "rgba(251, 191, 36, 0.3)",
  },
};

async function getGemImageSrc(seed: string): Promise<string> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") || host?.startsWith("127.0.0.1")
      ? "http"
      : "https");
  const origin = host ? `${protocol}://${host}` : getGemSiteUrl();
  const imageUrl = getGemApiImageUrl(seed, origin);

  try {
    const response = await fetch(imageUrl, {
      cache: "no-store",
      redirect: "follow",
    });

    if (response.ok) {
      const contentType = response.headers.get("content-type") ?? "image/png";
      const bytes = await response.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      return `data:${contentType};base64,${base64}`;
    }
  } catch {
    // Fall back to the canonical URL if the warmup fetch fails.
  }

  return imageUrl;
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
  const fontText = `${seed} ${gemTypeName} ${cutTypeName} ${rarityName} Get yours at gems.m3000.io @`;
  const [interMedium, interSemibold] = await Promise.all([
    loadInterFont(500, fontText),
    loadInterFont(600, fontText),
  ]);
  const badge = RARITY_BADGE_COLORS[rarityName];

  const displaySeed = seed.length > 20 ? `${seed.slice(0, 20)}…` : seed;
  const seedFontSize = seed.length > 16 ? (seed.length > 20 ? 34 : 40) : 48;
  const gemSize = 208;
  const pillStyle = {
    display: "flex",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "solid",
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 6,
    paddingBottom: 6,
    fontSize: 16,
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
          <img src={gemImageSrc} width={gemSize} height={gemSize} alt={seed} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignSelf: "center",
          flex: 1,
          maxWidth: 620,
          gap: 34,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 22,
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
                letterSpacing: "-0.035em",
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
                borderColor: badge.border,
                textTransform: "capitalize",
              }}
            >
              {rarityName}
            </div>
            <div
              style={{
                ...pillStyle,
                background: "rgba(23, 23, 23, 0.7)",
                color: "#a3a3a3",
                borderColor: "rgba(64, 64, 64, 0.8)",
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            >
              {gemTypeName}
            </div>
            <div
              style={{
                ...pillStyle,
                background: "rgba(23, 23, 23, 0.7)",
                color: "#a3a3a3",
                borderColor: "rgba(64, 64, 64, 0.8)",
                fontWeight: 500,
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
            color: "#737373",
            fontSize: 20,
            lineHeight: 1,
            letterSpacing: "-0.01em",
          }}
        >
          Get yours at gems.m3000.io
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: interMedium,
          style: "normal",
          weight: 500,
        },
        {
          name: "Inter",
          data: interSemibold,
          style: "normal",
          weight: 600,
        },
      ],
      headers: {
        "Cache-Control":
          "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
