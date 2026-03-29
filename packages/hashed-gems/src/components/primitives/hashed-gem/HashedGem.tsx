"use client";

import type * as React from "react";
import { cn } from "@/lib/cn";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";
import { useWebGL } from "./useWebGL";

export type GemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface HashedGemProps {
  /** Display size in pixels (canvas width & height). Default: 64 */
  size?: number;
  /** Any string — username, address, id — hashed to a deterministic avatar. Default: "" */
  seed?: string;
  /** Render a single frame and stop animating. Good for lists. Default: false */
  static?: boolean;
  /** Override the gem type derived from seed. 0=diamond 1=ruby 2=sapphire 3=emerald 4=topaz 5=amethyst 6=aquamarine 7=rose-quartz 8=citrine 9=onyx 10=alexandrite 11=opal */
  gemType?: number;
  /** Override the cut type derived from seed. 0=round-brilliant 1=princess 2=cushion 3=emerald-step */
  cutType?: number;
  className?: string;
}

// ── Hashing ─────────────────────────────────────────────────────────────────
// 1. hashString128: deterministic 128-bit seed from any string (4 × 32-bit words)
// 2. sfc32: high-quality PRNG seeded from those words — each call returns [0, 1)
// This gives us billions of distinct visual variations from any input string.

/** Hash a string into four 32-bit words for sfc32 seeding */
function hashString128(str: string): [number, number, number, number] {
  let h1 = 0x811c9dc5 >>> 0;
  let h2 = 0x6a09e667 >>> 0;
  let h3 = 0xbb67ae85 >>> 0;
  let h4 = 0x3c6ef372 >>> 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ ch, 0x5bd1e995) >>> 0;
    h3 = Math.imul(h3 ^ ch, 0x1b873593) >>> 0;
    h4 = Math.imul(h4 ^ ch, 0xcc9e2d51) >>> 0;
  }
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b) >>> 0;
  h1 ^= h1 >>> 13;
  h2 ^= h2 >>> 16;
  h2 = Math.imul(h2, 0xc2b2ae35) >>> 0;
  h2 ^= h2 >>> 13;
  h3 ^= h3 >>> 16;
  h3 = Math.imul(h3, 0x85ebca6b) >>> 0;
  h3 ^= h3 >>> 13;
  h4 ^= h4 >>> 16;
  h4 = Math.imul(h4, 0xc2b2ae35) >>> 0;
  h4 ^= h4 >>> 13;
  return [h1, h2, h3, h4];
}

/** sfc32 — Small Fast Chaotic PRNG. Returns () => float in [0, 1) */
function sfc32(seed: [number, number, number, number]): () => number {
  let [a, b, c, d] = seed;
  return () => {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

/** Derive rarity tier from a random roll [0, 1) */
function deriveRarity(roll: number): { rarity: GemRarity; rarityInt: number } {
  if (roll >= 0.99) return { rarity: "legendary", rarityInt: 4 }; // 1%
  if (roll >= 0.95) return { rarity: "epic", rarityInt: 3 }; // 4%
  if (roll >= 0.85) return { rarity: "rare", rarityInt: 2 }; // 10%
  if (roll >= 0.6) return { rarity: "uncommon", rarityInt: 1 }; // 25%
  return { rarity: "common", rarityInt: 0 }; // 60%
}

export function HashedGem({
  size = 64,
  seed = "",
  static: isStatic = false,
  gemType,
  cutType,
  className,
}: HashedGemProps): React.ReactElement {
  // Create a deterministic PRNG from the seed string
  const rng = sfc32(hashString128(seed));

  // Draw values in a fixed order — each rng() call is independently random
  const uSeed = rng() * 1000.0; // [0, 1000) — fine visual variation
  const uGemType = gemType ?? Math.floor(rng() * 12); // 0–11 (overridable)
  const uCutType = cutType ?? Math.floor(rng() * 4); // 0–3  (overridable)
  const uCausticCount = 3 + Math.floor(rng() * 4); // 3–6
  const { rarityInt: uRarity } = deriveRarity(rng()); // rarity tier

  const canvasRef = useWebGL({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: { uSeed, uCausticCount, uGemType, uCutType, uRarity, size },
    isStatic,
  });

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={cn("block shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Hashed gem avatar"
    />
  );
}
