import { hashString128, sfc32 } from "./rng";

export const GEM_TYPES = [
  "diamond",
  "ruby",
  "sapphire",
  "emerald",
  "topaz",
  "amethyst",
  "aquamarine",
  "rose-quartz",
  "citrine",
  "onyx",
  "alexandrite",
  "opal",
] as const;

export const CUT_TYPES = [
  "round-brilliant",
  "princess",
  "cushion",
  "emerald-step",
  "firework",
  "jubilee",
  "rose",
] as const;

export const CUT_VARIANTS = [
  "classic",
  "open",
  "starburst",
  "crisp",
  "broad",
  "compressed",
  "soft",
  "balanced",
  "squarish",
  "compact",
  "elongated",
  "tight",
  "full",
  "low-dome",
  "high-crown",
  "bloom",
] as const;

export const RARITIES = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
] as const;

export type GemType = (typeof GEM_TYPES)[number];
export type CutType = (typeof CUT_TYPES)[number];
export type CutVariant = (typeof CUT_VARIANTS)[number];
export type Rarity = (typeof RARITIES)[number];

export const CUT_VARIANTS_BY_CUT: Record<CutType, readonly CutVariant[]> = {
  "round-brilliant": ["classic", "open", "starburst"],
  princess: ["crisp", "broad", "compressed"],
  cushion: ["soft", "balanced", "squarish"],
  "emerald-step": ["compact", "classic", "elongated"],
  firework: ["tight", "balanced", "full"],
  jubilee: ["low-dome", "classic", "high-crown"],
  rose: ["tight", "balanced", "bloom"],
};

export const CUT_VARIANT_LABELS: Record<CutVariant, string> = {
  classic: "classic",
  open: "open",
  starburst: "starburst",
  crisp: "crisp",
  broad: "broad",
  compressed: "compressed",
  soft: "soft",
  balanced: "balanced",
  squarish: "squarish",
  compact: "compact",
  elongated: "elongated",
  tight: "tight",
  full: "full",
  "low-dome": "low dome",
  "high-crown": "high crown",
  bloom: "bloom",
};

export interface GemProperties {
  gemType: number;
  gemTypeName: GemType;
  cutType: number;
  cutTypeName: CutType;
  rarity: number;
  rarityName: Rarity;
  causticCount: number;
}

export function getShaderSeed(seed: string): number {
  const rng = sfc32(hashString128(seed));
  return rng() * 1000.0;
}

function fract(value: number): number {
  return value - Math.floor(value);
}

function hash11(value: number): number {
  return fract(Math.sin(value * 127.1) * 43758.5453);
}

function seededSpan(
  seed: number,
  salt: number,
  minValue: number,
  maxValue: number,
): number {
  return minValue + (maxValue - minValue) * hash11(seed * 0.173 + salt * 13.1);
}

function getCutVariantFromSeedNumber(
  cutTypeName: CutType,
  seed: number,
): CutVariant {
  switch (cutTypeName) {
    case "round-brilliant": {
      const tableRatio = seededSpan(seed, 20, 0.1, 0.14);
      const starReach = seededSpan(seed, 21, 0.09, 0.13);
      if (tableRatio > 0.127) return "open";
      if (starReach > 0.117) return "starburst";
      return "classic";
    }
    case "princess": {
      const diagWidth = seededSpan(seed, 32, 0.12, 0.2);
      const sideCompression = seededSpan(seed, 40, 0.1, 0.28);
      if (diagWidth > 0.173) return "broad";
      if (sideCompression > 0.22) return "compressed";
      return "crisp";
    }
    case "cushion": {
      const superellipsePower = seededSpan(seed, 50, 2.15, 3.1);
      if (superellipsePower < 2.45) return "soft";
      if (superellipsePower > 2.8) return "squarish";
      return "balanced";
    }
    case "emerald-step": {
      const aspectRatio = seededSpan(seed, 60, 1.22, 1.44);
      if (aspectRatio < 1.29) return "compact";
      if (aspectRatio > 1.37) return "elongated";
      return "classic";
    }
    case "firework": {
      const burstRadius = seededSpan(seed, 80, 0.03, 0.08);
      if (burstRadius < 0.045) return "tight";
      if (burstRadius > 0.062) return "full";
      return "balanced";
    }
    case "jubilee": {
      const domeWave = seededSpan(seed, 90, 0.018, 0.045);
      if (domeWave < 0.027) return "low-dome";
      if (domeWave > 0.036) return "high-crown";
      return "classic";
    }
    case "rose": {
      const bloomStrength = seededSpan(seed, 100, 0.035, 0.075);
      if (bloomStrength < 0.048) return "tight";
      if (bloomStrength > 0.062) return "bloom";
      return "balanced";
    }
  }
}

export function getCutVariant(seed: string, cutType: CutType): CutVariant {
  return getCutVariantFromSeedNumber(cutType, getShaderSeed(seed));
}

export function getCutVariantLabel(cutVariant: CutVariant): string {
  return CUT_VARIANT_LABELS[cutVariant];
}

function deriveRarity(roll: number): { rarity: Rarity; rarityInt: number } {
  if (roll >= 0.99) return { rarity: "legendary", rarityInt: 4 };
  if (roll >= 0.95) return { rarity: "epic", rarityInt: 3 };
  if (roll >= 0.85) return { rarity: "rare", rarityInt: 2 };
  if (roll >= 0.6) return { rarity: "uncommon", rarityInt: 1 };
  return { rarity: "common", rarityInt: 0 };
}

export function getGemProperties(seed: string): GemProperties {
  const rng = sfc32(hashString128(seed));

  rng() * 1000.0;
  const uGemType = Math.floor(rng() * GEM_TYPES.length);
  const uCutType = Math.floor(rng() * CUT_TYPES.length);
  const { rarityInt: uRarity, rarity } = deriveRarity(rng());
  const uCausticCount = 3 + Math.floor(rng() * 4);

  return {
    gemType: uGemType,
    gemTypeName: GEM_TYPES[uGemType],
    cutType: uCutType,
    cutTypeName: CUT_TYPES[uCutType],
    rarity: uRarity,
    rarityName: rarity,
    causticCount: uCausticCount,
  };
}
