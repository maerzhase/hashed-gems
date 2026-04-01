import type { GemType, Rarity } from "./gem";
import { CUT_TYPES, GEM_TYPES, RARITIES } from "./gem";

export interface GemColors {
  inner: string;
  outer: string;
  accent: string;
}

const gemColorsMap: Record<GemType, GemColors> = {
  diamond: { inner: "#ffffff", outer: "#d0d0e0", accent: "#ffffff" },
  ruby: { inner: "#ff4040", outer: "#600000", accent: "#ff8080" },
  sapphire: { inner: "#4040ff", outer: "#000060", accent: "#8080ff" },
  emerald: { inner: "#40ff40", outer: "#004000", accent: "#80ff80" },
  topaz: { inner: "#ffe040", outer: "#806000", accent: "#fff080" },
  amethyst: { inner: "#ff40ff", outer: "#400060", accent: "#ff80ff" },
  aquamarine: { inner: "#40e0ff", outer: "#006060", accent: "#80f0ff" },
  "rose-quartz": { inner: "#ff90b0", outer: "#800050", accent: "#ffb0c0" },
  citrine: { inner: "#ffa040", outer: "#804000", accent: "#ffc080" },
  onyx: { inner: "#303030", outer: "#000000", accent: "#505050" },
  alexandrite: { inner: "#40ff80", outer: "#204010", accent: "#80ffb0" },
  opal: { inner: "#ffffff", outer: "#b0a090", accent: "#ffffff" },
};

const rarityGlowSizes: Record<Rarity, number> = {
  common: 0,
  uncommon: 4,
  rare: 10,
  epic: 16,
  legendary: 24,
};

const rarityGlowAlphas: Record<Rarity, number> = {
  common: 0,
  uncommon: 0.45,
  rare: 0.65,
  epic: 0.8,
  legendary: 0.95,
};

const rarityIntensityMap: Record<Rarity, number> = {
  common: 0,
  uncommon: 0.3,
  rare: 0.5,
  epic: 0.7,
  legendary: 1.0,
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

export function getGemColors(gemType: GemType): GemColors {
  return gemColorsMap[gemType];
}

export function getRarityGlow(rarity: Rarity, gemType: GemType): string {
  if (rarity === "common") return "0px 0px 0px rgba(0,0,0,0)";
  const size = rarityGlowSizes[rarity];
  const alpha = rarityGlowAlphas[rarity];
  const [r, g, b] = hexToRgb(gemColorsMap[gemType].inner);
  return `0px 0px ${size}px rgba(${r},${g},${b},${alpha})`;
}

export function getRarityIntensity(rarity: Rarity): number {
  return rarityIntensityMap[rarity];
}

export { GEM_TYPES, CUT_TYPES, RARITIES };
