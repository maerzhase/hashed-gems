import type { Rarity } from "@m3000/hashed-gems";
import { getGemColors, getGemProperties } from "@m3000/hashed-gems";
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

const RARITY_GLOW_ALPHA: Record<Rarity, number> = {
  common: 0,
  uncommon: 0.3,
  rare: 0.5,
  epic: 0.65,
  legendary: 0.8,
};

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [255, 255, 255];
}

export default async function Image({
  params,
}: {
  params: Promise<{ seed: string }>;
}) {
  const { seed: raw } = await params;
  const seed = decodeURIComponent(raw);

  const { gemTypeName, cutTypeName, rarityName } = getGemProperties(seed);
  const { inner } = getGemColors(gemTypeName);
  const badge = RARITY_BADGE_COLORS[rarityName];
  const glowAlpha = RARITY_GLOW_ALPHA[rarityName];
  const [r, g, b] = hexToRgb(inner);

  const displaySeed = seed.length > 20 ? `${seed.slice(0, 20)}…` : seed;
  const seedFontSize = seed.length > 16 ? (seed.length > 20 ? 44 : 52) : 68;

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        alignItems: "center",
        background: "#0a0a0a",
        paddingLeft: 160,
        paddingRight: 104,
      }}
    >
      {/* Gem with glow */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {glowAlpha > 0 && (
          <div
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              background: `radial-gradient(circle at center, rgba(${r},${g},${b},${glowAlpha}) 0%, transparent 65%)`,
            }}
          />
        )}
        <div style={{ display: "flex", width: 128, height: 128 }}>
          {/* biome-ignore lint/performance/noImgElement: next/og context, <Image> not available */}
          <img
            src={getGemAssetUrl(seed)}
            width={128}
            height={128}
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
          marginLeft: 88,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            lineHeight: 1.1,
            marginBottom: 36,
          }}
        >
          <span
            style={{
              fontSize: seedFontSize,
              fontWeight: 700,
              color: "#525252",
            }}
          >
            @
          </span>
          <span
            style={{
              fontSize: seedFontSize,
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            {displaySeed}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 44,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: badge.bg,
              color: badge.text,
              borderRadius: 999,
              paddingLeft: 18,
              paddingRight: 18,
              paddingTop: 7,
              paddingBottom: 7,
              fontSize: 24,
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {rarityName}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#262626",
              color: "#a3a3a3",
              borderRadius: 999,
              paddingLeft: 18,
              paddingRight: 18,
              paddingTop: 7,
              paddingBottom: 7,
              fontSize: 24,
              textTransform: "capitalize",
            }}
          >
            {gemTypeName}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#262626",
              color: "#a3a3a3",
              borderRadius: 999,
              paddingLeft: 18,
              paddingRight: 18,
              paddingTop: 7,
              paddingBottom: 7,
              fontSize: 24,
              textTransform: "lowercase",
            }}
          >
            {cutTypeName} cut
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "#525252",
            fontSize: 24,
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
