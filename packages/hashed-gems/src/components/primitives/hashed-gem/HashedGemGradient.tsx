import type * as React from "react";
import { getGemColors, getRarityGlow } from "@/lib/colors";
import type { CutType, GemType, Rarity } from "@/lib/gem";
import { getGemProperties, getShaderSeed } from "@/lib/gem";
import { CUT_MODULES } from "./cuts/index";

export interface HashedGemGradientProps {
  /** CSS display size in pixels for standalone rendering. Defaults to 64. */
  size?: number;
  seed: string;
  gemType?: GemType;
  cutType?: CutType;
  className?: string;
  position?: "absolute" | "relative";
}

// Replicate the shader's initial light angle (at uTime=0) from uSeed
// so the CSS highlight positions match the WebGL gem's initial bright spots.
function shaderLightAngles(uSeed: number): {
  angle1: number;
  angle2: number;
} {
  const angle1 = Math.sin(uSeed * 0.004);
  const angle2 = Math.sin(uSeed * 0.007) + Math.PI / 3;
  return { angle1, angle2 };
}

// Replicate alexandrite's time-varying color shift (shader: sin(uTime*0.12 + uSeed*0.7))
// At uTime=0 the phase is entirely seed-driven.
function getAlexandriteColors(uSeed: number): { inner: string; outer: string } {
  const t = Math.sin(uSeed * 0.7) * 0.5 + 0.5; // 0 = green, 1 = red
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  const h = (n: number) => n.toString(16).padStart(2, "0");
  // green state: #40ff80 / #204010 — red state: #ff4060 / #601020
  const ri = lerp(0x40, 0xff),
    gi = lerp(0xff, 0x40),
    bi = lerp(0x80, 0x60);
  const ro = lerp(0x20, 0x60),
    go = lerp(0x40, 0x10),
    bo = lerp(0x10, 0x20);
  return {
    inner: `#${h(ri)}${h(gi)}${h(bi)}`,
    outer: `#${h(ro)}${h(go)}${h(bo)}`,
  };
}

function getFacetOverlay(
  cutType: CutType,
  seedNum: number,
  borderRadius: string,
): React.CSSProperties {
  return CUT_MODULES[cutType].cssGradient(seedNum, borderRadius);
}

function getAsterismOverlay(
  rarity: Rarity,
  borderRadius: string,
): React.CSSProperties | null {
  if (rarity !== "epic" && rarity !== "legendary") return null;
  const opacity = rarity === "legendary" ? 0.25 : 0.15;
  return {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius,
    background: `
      linear-gradient(0deg, transparent 40%, rgba(255,255,255,${opacity}) 50%, transparent 60%),
      linear-gradient(60deg, transparent 40%, rgba(255,255,255,${opacity}) 50%, transparent 60%),
      linear-gradient(120deg, transparent 40%, rgba(255,255,255,${opacity}) 50%, transparent 60%)
    `,
    mixBlendMode: "screen",
    pointerEvents: "none",
  };
}

function getOpalRainbowOverlay(
  gemTypeName: GemType,
  borderRadius: string,
): React.CSSProperties | null {
  if (gemTypeName !== "opal") return null;
  return {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius,
    background: `conic-gradient(
      from 0deg at 50% 50%,
      rgba(255,80,80,0.3),
      rgba(255,180,0,0.3),
      rgba(255,255,80,0.3),
      rgba(80,220,120,0.3),
      rgba(80,140,255,0.3),
      rgba(160,60,220,0.3),
      rgba(240,120,240,0.3),
      rgba(255,80,80,0.3)
    )`,
    mixBlendMode: "screen",
    pointerEvents: "none",
  };
}

export function HashedGemGradient({
  size,
  seed,
  gemType,
  cutType,
  className,
  position = "relative",
}: HashedGemGradientProps): React.ReactElement {
  const props = getGemProperties(seed);
  const shaderSeed = getShaderSeed(seed);

  const gemTypeName = gemType ?? props.gemTypeName;
  const cutTypeName = cutType ?? props.cutTypeName;
  const rarityName = props.rarityName;

  const isLightGem = gemTypeName === "diamond" || gemTypeName === "opal";
  const isAlexandrite = gemTypeName === "alexandrite";

  let colors = getGemColors(gemTypeName);
  if (isAlexandrite) {
    colors = { ...colors, ...getAlexandriteColors(shaderSeed) };
  }
  const glow = getRarityGlow(rarityName, gemTypeName);
  // Let the container or className define the silhouette.
  // Cut type should only affect the internal gradient detail, not the outer shape.
  const borderRadius = "inherit";

  // Use the same seed value and light angle formula as the WebGL shader
  const { angle1, angle2 } = shaderLightAngles(shaderSeed);
  const sparkleX = Math.round(50 + Math.cos(angle1) * 22);
  const sparkleY = Math.round(50 - Math.sin(angle1) * 22);
  // Secondary highlight from shader's second light
  const hi2X = Math.round(50 + Math.cos(angle2) * 18);
  const hi2Y = Math.round(50 - Math.sin(angle2) * 18);
  // Third softer highlight (opposite side of primary, approximating back-scatter)
  const hi3X = Math.round(50 - Math.cos(angle1) * 14);
  const hi3Y = Math.round(50 + Math.sin(angle1) * 14);

  const baseGradient = `
    radial-gradient(circle at ${sparkleX}% ${sparkleY}%, ${colors.inner} 0%, ${colors.inner} 30%, ${colors.outer} 60%, transparent 100%)
  `;

  const sparkleGradient = `
    radial-gradient(circle at ${sparkleX}% ${sparkleY}%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 15%, transparent 40%),
    radial-gradient(circle at ${hi2X}% ${hi2Y}%, rgba(255,255,255,0.5) 0%, transparent 25%),
    radial-gradient(circle at ${hi3X}% ${hi3Y}%, rgba(255,255,255,0.3) 0%, transparent 20%),
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 40%)
  `;

  const resolvedSize = size ?? (position === "absolute" ? "100%" : 64);

  const gradientStyle: React.CSSProperties = {
    width: resolvedSize,
    height: resolvedSize,
    background: `${baseGradient}, ${sparkleGradient}`,
    backgroundBlendMode: isLightGem ? "screen" : "normal",
    boxShadow: glow,
    position,
    overflow: "hidden",
    ...(position === "absolute" ? { top: 0, left: 0 } : {}),
  };

  const highlightOverlay: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius,
    background: isLightGem
      ? `
        radial-gradient(circle at ${sparkleX}% ${sparkleY}%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 20%, transparent 50%),
        radial-gradient(circle at ${hi2X}% ${hi2Y}%, rgba(200,220,255,0.6) 0%, transparent 30%),
        radial-gradient(circle at ${hi3X}% ${hi3Y}%, rgba(255,255,255,0.5) 0%, transparent 35%)
      `
      : isAlexandrite
        ? `
        radial-gradient(circle at ${sparkleX}% ${sparkleY}%, rgba(255,255,255,0.7) 0%, transparent 40%),
        radial-gradient(circle at ${hi2X}% ${hi2Y}%, rgba(255,200,200,0.5) 0%, transparent 25%)
      `
        : `
        radial-gradient(circle at ${sparkleX}% ${sparkleY}%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 15%, transparent 45%),
        radial-gradient(circle at ${hi2X}% ${hi2Y}%, rgba(255,255,255,0.4) 0%, transparent 20%),
        radial-gradient(circle at ${hi3X}% ${hi3Y}%, rgba(255,255,255,0.3) 0%, transparent 20%)
      `,
    pointerEvents: "none",
    mixBlendMode: "screen",
  };

  // Edge absorption: dark outer vignette + soft inner rim light
  const edgeVignette: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius,
    background:
      "radial-gradient(circle at center, transparent 52%, rgba(0,0,0,0.4) 80%, transparent 100%)",
    boxShadow: "inset 0 0 25px rgba(255,255,255,0.12)",
    pointerEvents: "none",
  };

  const facetOverlay = getFacetOverlay(cutTypeName, shaderSeed, borderRadius);
  const asterismOverlay = getAsterismOverlay(rarityName, borderRadius);
  const opalRainbow = getOpalRainbowOverlay(gemTypeName, borderRadius);

  return (
    <div
      className={`hashed-gem-gradient ${className}`}
      style={gradientStyle}
      role="img"
      aria-label={`${gemTypeName} gem`}
    >
      <div style={edgeVignette} />
      <div style={facetOverlay} />
      <div style={highlightOverlay} />
      {opalRainbow && <div style={opalRainbow} />}
      {asterismOverlay && <div style={asterismOverlay} />}
    </div>
  );
}
