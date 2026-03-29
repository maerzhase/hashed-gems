import type * as React from "react";
import { getCutBorderRadius, getGemColors, getRarityGlow } from "@/lib/colors";
import type { CutType, GemType } from "@/lib/gem";
import { getGemProperties } from "@/lib/gem";

export interface HashedGemGradientProps {
  size?: number;
  seed: string;
  gemType?: GemType;
  cutType?: CutType;
  className?: string;
  position?: "absolute" | "relative";
}

function seedToNumber(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function HashedGemGradient({
  size = 64,
  seed,
  gemType,
  cutType,
  className,
  position = "relative",
}: HashedGemGradientProps): React.ReactElement {
  const props = getGemProperties(seed);

  const gemTypeName = gemType ?? props.gemTypeName;
  const rarityName = props.rarityName;

  const colors = getGemColors(gemTypeName);
  const glow = getRarityGlow(rarityName);
  const borderRadius = getCutBorderRadius(cutType ?? props.cutTypeName);

  const seedNum = seedToNumber(seed);
  const sparkleX = 30 + (seedNum % 20);
  const sparkleY = 30 + ((seedNum >> 4) % 20);

  const isLightGem = gemTypeName === "diamond" || gemTypeName === "opal";
  const isAlexandrite = gemTypeName === "alexandrite";

  const baseGradient = `
    radial-gradient(circle at ${sparkleX}% ${sparkleY}%, ${colors.inner} 0%, ${colors.inner} 30%, ${colors.outer} 70%, ${colors.outer} 100%)
  `;

  const sparkleGradient = `
    radial-gradient(circle at ${sparkleX}% ${sparkleY}%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 15%, transparent 40%),
    radial-gradient(circle at ${100 - sparkleX}% ${sparkleY}%, rgba(255,255,255,0.5) 0%, transparent 25%),
    radial-gradient(circle at ${sparkleX}% ${100 - sparkleY}%, rgba(255,255,255,0.4) 0%, transparent 20%),
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 40%),
    radial-gradient(circle at 70% 70%, rgba(255,255,255,0.3) 0%, transparent 20%)
  `;

  const gradientStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius,
    background: `${baseGradient}, ${sparkleGradient}`,
    backgroundBlendMode: isLightGem ? "screen" : "normal",
    boxShadow: glow,
    position,
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
        radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 20%, transparent 50%),
        radial-gradient(circle at 65% 25%, rgba(200,220,255,0.6) 0%, transparent 30%),
        radial-gradient(circle at 25% 65%, rgba(255,255,255,0.5) 0%, transparent 35%),
        radial-gradient(circle at 70% 70%, rgba(180,200,255,0.4) 0%, transparent 25%)
      `
      : isAlexandrite
        ? `
        radial-gradient(circle at 35% 35%, rgba(255,255,255,0.7) 0%, transparent 40%),
        radial-gradient(circle at 65% 30%, rgba(255,200,200,0.5) 0%, transparent 25%)
      `
        : `
        radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 15%, transparent 45%),
        radial-gradient(circle at 65% 30%, rgba(255,255,255,0.4) 0%, transparent 20%),
        radial-gradient(circle at 25% 70%, rgba(255,255,255,0.3) 0%, transparent 20%)
      `,
    pointerEvents: "none",
    mixBlendMode: isLightGem ? "screen" : "screen",
  };

  const edgeHighlight: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius,
    background: `
      inset 0 0 ${size * 0.5}px ${size * 0.25}px rgba(255,255,255,0.25),
      inset 0 0 ${size * 0.8}px ${size * 0.4}px rgba(255,255,255,0.12)
    `,
    pointerEvents: "none",
  };

  return (
    <div
      className={`hashed-gem-gradient ${className}`}
      style={gradientStyle}
      role="img"
      aria-label={`${gemTypeName} gem`}
    >
      <div style={highlightOverlay} />
      <div style={edgeHighlight} />
    </div>
  );
}
