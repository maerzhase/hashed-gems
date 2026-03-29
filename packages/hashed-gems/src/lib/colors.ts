import type { CutType, GemType, Rarity } from "./gem";
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

const rarityGlowMap: Record<Rarity, string> = {
  common: "0px 0px 0px rgba(0,0,0,0)",
  uncommon: "0px 0px 4px rgba(255,255,255,0.3)",
  rare: "0px 0px 8px rgba(255,255,255,0.5)",
  epic: "0px 0px 12px rgba(255,255,255,0.7)",
  legendary: "0px 0px 20px rgba(255,255,255,0.9)",
};

const rarityIntensityMap: Record<Rarity, number> = {
  common: 0,
  uncommon: 0.3,
  rare: 0.5,
  epic: 0.7,
  legendary: 1.0,
};

export function getGemColors(gemType: GemType): GemColors {
  return gemColorsMap[gemType];
}

export function getRarityGlow(rarity: Rarity): string {
  return rarityGlowMap[rarity];
}

export function getRarityIntensity(rarity: Rarity): number {
  return rarityIntensityMap[rarity];
}

export function getCutBorderRadius(_cutType: CutType): string {
  return "0px";
}

export { GEM_TYPES, CUT_TYPES, RARITIES };
