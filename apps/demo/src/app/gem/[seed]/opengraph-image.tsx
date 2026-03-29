import type { Rarity } from "@m3000/hashed-gems";
import { getGemColors, getGemProperties } from "@m3000/hashed-gems";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
  const { inner, outer } = getGemColors(gemTypeName);
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
        background: "#0a0a0a",
      }}
    >
      {/* Left: gem visual */}
      <div
        style={{
          width: 580,
          height: 630,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Glow behind gem */}
        {glowAlpha > 0 && (
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              background: `radial-gradient(circle at center, rgba(${r},${g},${b},${glowAlpha}) 0%, transparent 65%)`,
            }}
          />
        )}

        <div
          style={{
            display: "flex",
            width: 280,
            height: 280,
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: next/og context, <Image> not available */}
          <img
            src={`https://c36zhng9zp5ehtzj.public.blob.vercel-storage.com/gems/${encodeURIComponent(seed)}.png`}
            width={280}
            height={280}
            alt={seed}
          />
        </div>
      </div>

      {/* Right: text */}
      <div
        style={{
          width: 620,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 48,
          paddingRight: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "#737373",
            fontSize: 20,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          MY GEM
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            lineHeight: 1.1,
            marginBottom: 32,
            maxWidth: 520,
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
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: badge.bg,
              color: badge.text,
              borderRadius: 999,
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 6,
              paddingBottom: 6,
              fontSize: 20,
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
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 6,
              paddingBottom: 6,
              fontSize: 20,
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
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 6,
              paddingBottom: 6,
              fontSize: 20,
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
            fontSize: 20,
          }}
        >
          gems.m3000.io
        </div>
      </div>
    </div>,
    { ...size },
  );
}
