import { getGemColors, getGemProperties } from "@m3000/hashed-gems";
import type { Rarity } from "@m3000/hashed-gems";
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
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [255, 255, 255];
}

export default async function Image({
  params,
}: { params: Promise<{ seed: string }> }) {
  const { seed: raw } = await params;
  const seed = decodeURIComponent(raw);

  const { gemTypeName, rarityName } = getGemProperties(seed);
  const { inner, outer } = getGemColors(gemTypeName);
  const badge = RARITY_BADGE_COLORS[rarityName];
  const glowAlpha = RARITY_GLOW_ALPHA[rarityName];
  const [r, g, b] = hexToRgb(inner);

  // Try to load real gem PNG from Vercel Blob
  let gemImageUrl: string | null = null;
  try {
    const { head } = await import("@vercel/blob");
    const info = await head(`gems/${encodeURIComponent(seed)}.png`);
    gemImageUrl = info.url;
  } catch {
    // Blob not found or not configured — use gradient fallback
  }

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
              width: 420,
              height: 420,
              borderRadius: "50%",
              background: `radial-gradient(circle at center, rgba(${r},${g},${b},${glowAlpha}) 0%, transparent 65%)`,
            }}
          />
        )}

        {gemImageUrl ? (
          // Real gem PNG from Vercel Blob
          // biome-ignore lint/performance/noImgElement: next/og context, <Image> not available
          <img
            src={gemImageUrl}
            width={400}
            height={400}
            alt={seed}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          // Gradient fallback gem
          <div
            style={{
              width: 360,
              height: 360,
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 30%, ${inner} 0%, ${inner} 20%, ${outer} 65%, ${outer} 100%)`,
              position: "relative",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 18%, transparent 42%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 68% 72%, rgba(255,255,255,0.25) 0%, transparent 30%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at center, transparent 52%, rgba(0,0,0,0.7) 100%)",
              }}
            />
          </div>
        )}
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
            color: "#737373",
            fontSize: 20,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          YOUR GEM
        </div>

        <div
          style={{
            color: "#ffffff",
            fontSize: seedFontSize,
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 32,
            maxWidth: 520,
          }}
        >
          {displaySeed}
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 48 }}>
          <div
            style={{
              background: badge.bg,
              color: badge.text,
              borderRadius: 999,
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 8,
              paddingBottom: 8,
              fontSize: 24,
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {rarityName}
          </div>
          <div
            style={{
              background: "#262626",
              color: "#a3a3a3",
              borderRadius: 999,
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 8,
              paddingBottom: 8,
              fontSize: 24,
              textTransform: "capitalize",
            }}
          >
            {gemTypeName}
          </div>
        </div>

        <div style={{ color: "#525252", fontSize: 20 }}>
          hashed-gems.vercel.app
        </div>
      </div>
    </div>,
    { ...size },
  );
}
