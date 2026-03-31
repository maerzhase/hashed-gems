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

export const RARITIES = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
] as const;

export type GemType = (typeof GEM_TYPES)[number];
export type CutType = (typeof CUT_TYPES)[number];
export type Rarity = (typeof RARITIES)[number];

export interface GemProperties {
  gemType: number;
  gemTypeName: GemType;
  cutType: number;
  cutTypeName: CutType;
  rarity: number;
  rarityName: Rarity;
  seed: number;
  causticCount: number;
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

  const uSeed = rng() * 1000.0;
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
    seed: uSeed,
    causticCount: uCausticCount,
  };
}
